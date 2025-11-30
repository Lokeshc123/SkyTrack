const cron = require('node-cron')
const Task = require('../models/Task')
const User = require('../models/User')
const { notifyUser } = require('../utils/notify')
const { calculateTaskConfidence, getProjectHealthSummary } = require('../services/aiConfidence')
const { generateUserRecommendations, generateTeamInsights } = require('../services/aiRecommendation')
const geminiAI = require('../services/geminiAI')

function eodJob(app) {
  const io = app.get('io')
  cron.schedule('0 18 * * *', async () => {
    console.log('[Scheduler] Running EOD reminder job...')
    const tasks = await Task.find({
      status: { $in: ['todo','in_progress','blocked'] },
      assignee: { $ne: null }
    }).select('assignee').populate('assignee', 'notificationPreferences')

    const counts = new Map()
    for (const t of tasks) {
      const key = String(t.assignee._id || t.assignee)
      counts.set(key, (counts.get(key) || 0) + 1)
    }

    for (const [userId, count] of counts) {
      const user = await User.findById(userId)
      if (user && user.shouldReceiveNotification('eod_reminder') && !user.isQuietHours()) {
        await notifyUser(io, {
          userId,
          type: 'eod_reminder',
          title: 'End of day update',
          message: 'You have ' + count + ' active task(s). Add your update.',
          actionUrl: '/tasks'
        })
      }
    }
    console.log('[Scheduler] EOD reminder job completed')
  })
}

function deadlineJob(app) {
  const io = app.get('io')
  cron.schedule('0 * * * *', async () => {
    console.log('[Scheduler] Running deadline alert job...')
    const now = new Date()
    const soon = new Date(now.getTime() + 24*60*60*1000)
    const tasks = await Task.find({
      status: { $in: ['todo','in_progress','blocked'] },
      assignee: { $ne: null },
      dueDate: { $gte: now, $lte: soon }
    }).select('assignee title dueDate')

    for (const t of tasks) {
      const user = await User.findById(t.assignee)
      if (user && user.shouldReceiveNotification('deadline_soon') && !user.isQuietHours()) {
        await notifyUser(io, {
          userId: t.assignee,
          type: 'deadline_soon',
          title: 'Deadline approaching',
          message: '"' + t.title + '" is due by ' + new Date(t.dueDate).toLocaleString() + '.',
          actionUrl: '/tasks/' + t._id
        })
      }
    }
    console.log('[Scheduler] Deadline alert job completed')
  })
}

function aiConfidenceJob(app) {
  cron.schedule('0 */6 * * *', async () => {
    console.log('[Scheduler] Running AI confidence recalculation...')
    const tasks = await Task.find({ status: { $nin: ['done'] } }).select('_id')
    let updated = 0
    for (const task of tasks) {
      try {
        const confidence = await calculateTaskConfidence(task._id)
        if (confidence) {
          await Task.findByIdAndUpdate(task._id, { aiConfidence: confidence.score })
          updated++
        }
      } catch (err) {
        console.error('[Scheduler] Error calculating confidence:', err.message)
      }
    }
    console.log('[Scheduler] Updated AI confidence for ' + updated + ' tasks')
  })
}

function aiRecommendationJob(app) {
  const io = app.get('io')
  cron.schedule('0 9 * * *', async () => {
    console.log('[Scheduler] Running AI recommendation job...')
    const users = await User.find({ isActive: true }).select('_id notificationPreferences')
    for (const user of users) {
      try {
        if (!user.shouldReceiveNotification('ai_recommendation')) continue
        if (user.isQuietHours()) continue
        const recommendations = await generateUserRecommendations(user._id)
        const importantRecs = recommendations.filter(r => ['critical', 'high'].includes(r.priority))
        if (importantRecs.length > 0) {
          await notifyUser(io, {
            userId: user._id,
            type: 'ai_recommendation',
            title: 'AI Insight: ' + importantRecs[0].title,
            message: importantRecs[0].message,
            actionUrl: '/dashboard/recommendations',
            meta: { totalRecommendations: recommendations.length }
          })
        }
      } catch (err) {
        console.error('[Scheduler] Error generating recommendations:', err.message)
      }
    }
    console.log('[Scheduler] AI recommendation job completed')
  })
}

function geminiDailyInsightsJob(app) {
  const io = app.get('io')
  cron.schedule('30 8 * * *', async () => {
    console.log('[Scheduler] Running Gemini daily insights job...')
    if (!geminiAI.isAvailable()) {
      console.log('[Scheduler] Gemini AI not available, skipping...')
      return
    }
    const users = await User.find({ isActive: true }).select('_id notificationPreferences')
    for (const user of users) {
      try {
        if (!user.shouldReceiveNotification('ai_recommendation')) continue
        if (user.isQuietHours()) continue
        const result = await geminiAI.generateDailyInsights(user._id)
        if (result.insights && !result.error) {
          const insights = result.insights
          if (insights.riskAlert || insights.topPriority) {
            await notifyUser(io, {
              userId: user._id,
              type: 'ai_recommendation',
              title: 'Your Daily AI Briefing',
              message: insights.summary || insights.topPriority,
              actionUrl: '/dashboard/ai-insights',
              meta: { source: 'gemini', insights: insights }
            })
          }
        }
      } catch (err) {
        console.error('[Scheduler] Error generating Gemini insights:', err.message)
      }
    }
    console.log('[Scheduler] Gemini daily insights job completed')
  })
}

function managerInsightsJob(app) {
  const io = app.get('io')
  cron.schedule('0 10 * * 1-5', async () => {
    console.log('[Scheduler] Running manager insights job...')
    const managers = await User.find({ role: { $in: ['manager', 'admin'] }, isActive: true }).select('_id notificationPreferences')
    for (const manager of managers) {
      try {
        if (!manager.shouldReceiveNotification('ai_recommendation')) continue
        if (manager.isQuietHours()) continue
        let message = ''
        let insights = null
        if (geminiAI.isAvailable()) {
          const geminiResult = await geminiAI.generateTeamSummary(manager._id)
          if (geminiResult.summary && !geminiResult.error) {
            insights = geminiResult.summary
            message = insights.summary || 'Team health score: ' + insights.teamHealthScore + '%'
          }
        }
        if (!insights) {
          const ruleBasedInsights = await generateTeamInsights(manager._id)
          const criticalInsights = ruleBasedInsights.filter(i => ['critical', 'high'].includes(i.priority))
          if (criticalInsights.length > 0) {
            message = criticalInsights.length + ' issue(s) need attention. ' + criticalInsights[0].message
            insights = { criticalInsights }
          }
        }
        if (message) {
          await notifyUser(io, {
            userId: manager._id,
            type: 'ai_recommendation',
            title: 'Team Health Alert',
            message: message,
            actionUrl: '/dashboard/team-insights',
            meta: { insights }
          })
        }
      } catch (err) {
        console.error('[Scheduler] Error generating manager insights:', err.message)
      }
    }
    console.log('[Scheduler] Manager insights job completed')
  })
}

function overdueTasksJob(app) {
  const io = app.get('io')
  cron.schedule('0 */4 * * *', async () => {
    console.log('[Scheduler] Running overdue tasks check...')
    const now = new Date()
    const overdueTasks = await Task.find({
      status: { $nin: ['done'] },
      assignee: { $ne: null },
      dueDate: { $lt: now }
    }).select('assignee title dueDate')
    const tasksByUser = new Map()
    for (const task of overdueTasks) {
      const key = String(task.assignee)
      if (!tasksByUser.has(key)) tasksByUser.set(key, [])
      tasksByUser.get(key).push(task)
    }
    for (const [userId, tasks] of tasksByUser) {
      const user = await User.findById(userId)
      if (user && user.shouldReceiveNotification('deadline_soon') && !user.isQuietHours()) {
        await notifyUser(io, {
          userId,
          type: 'deadline_soon',
          title: 'Overdue Tasks Alert',
          message: 'You have ' + tasks.length + ' overdue task(s) that need attention.',
          actionUrl: '/tasks?filter=overdue',
          meta: { overdueTasks: tasks.map(t => ({ id: t._id, title: t.title })) }
        })
      }
    }
    console.log('[Scheduler] Overdue check completed. Found ' + overdueTasks.length + ' overdue.')
  })
}

function weeklyProjectSummaryJob(app) {
  const io = app.get('io')
  cron.schedule('0 9 * * 1', async () => {
    console.log('[Scheduler] Running weekly project summary...')
    const Project = require('../models/Project')
    const projects = await Project.find({ status: 'active' }).populate('owner')
    for (const project of projects) {
      try {
        if (!project.owner) continue
        const health = await getProjectHealthSummary(project._id)
        let message = 'Health: ' + health.overallHealth + '%. ' + health.taskCount + ' tasks, ' + health.atRiskTasks + ' at risk.'
        let retrospective = null
        if (geminiAI.isAvailable() && health.taskCount > 0) {
          const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
          const retroResult = await geminiAI.generateSprintRetrospective(project._id, twoWeeksAgo, new Date())
          if (retroResult.retrospective && !retroResult.error) {
            retrospective = retroResult.retrospective
            message = retrospective.velocitySummary || message
          }
        }
        if (health.taskCount > 0) {
          await notifyUser(io, {
            userId: project.owner._id,
            type: 'generic',
            title: 'Weekly Summary: ' + project.name,
            message: message,
            actionUrl: '/projects/' + project._id,
            meta: { health, retrospective }
          })
        }
      } catch (err) {
        console.error('[Scheduler] Error generating project summary:', err.message)
      }
    }
    console.log('[Scheduler] Weekly project summary completed')
  })
}

function initializeScheduler(app) {
  console.log('[Scheduler] Initializing scheduled jobs...')
  eodJob(app)
  deadlineJob(app)
  aiConfidenceJob(app)
  overdueTasksJob(app)
  aiRecommendationJob(app)
  geminiDailyInsightsJob(app)
  managerInsightsJob(app)
  weeklyProjectSummaryJob(app)
  console.log('[Scheduler] All jobs initialized')
  console.log('[Scheduler] Gemini AI:', geminiAI.isAvailable() ? 'ENABLED' : 'DISABLED')
}

module.exports = { 
  eodJob, deadlineJob, aiConfidenceJob, aiRecommendationJob,
  geminiDailyInsightsJob, managerInsightsJob, overdueTasksJob,
  weeklyProjectSummaryJob, initializeScheduler
}
