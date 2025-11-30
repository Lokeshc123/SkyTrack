const Task = require('../models/Task')
const User = require('../models/User')
const DailyUpdate = require('../models/DailyUpdate')
const Project = require('../models/Project')
const { calculateTaskConfidence, getProjectHealthSummary } = require('./aiConfidence')

/**
 * Generate personalized recommendations for a user based on their activity patterns
 */
async function generateUserRecommendations(userId) {
  const recommendations = []
  
  // Get user's tasks
  const tasks = await Task.find({
    assignee: userId,
    status: { $nin: ['done'] }
  }).populate('project').lean()

  // Get user's recent activity
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const recentUpdates = await DailyUpdate.find({
    author: userId,
    createdAt: { $gte: weekAgo }
  }).lean()

  // 1. Check for overdue tasks
  const now = new Date()
  const overdueTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate) < now)
  if (overdueTasks.length > 0) {
    recommendations.push({
      id: 'overdue-tasks',
      priority: 'critical',
      type: 'deadline',
      title: 'Overdue Tasks',
      message: `You have ${overdueTasks.length} overdue task(s). Consider updating status or requesting extensions.`,
      action: 'view_overdue',
      tasks: overdueTasks.map(t => ({ id: t._id, title: t.title, dueDate: t.dueDate }))
    })
  }

  // 2. Check for tasks due soon (next 48 hours)
  const soonDate = new Date(now.getTime() + 48 * 60 * 60 * 1000)
  const upcomingTasks = tasks.filter(t => 
    t.dueDate && 
    new Date(t.dueDate) >= now && 
    new Date(t.dueDate) <= soonDate &&
    t.progress < 80
  )
  if (upcomingTasks.length > 0) {
    recommendations.push({
      id: 'upcoming-deadlines',
      priority: 'high',
      type: 'deadline',
      title: 'Upcoming Deadlines',
      message: `${upcomingTasks.length} task(s) due in the next 48 hours need attention.`,
      action: 'focus_tasks',
      tasks: upcomingTasks.map(t => ({ id: t._id, title: t.title, progress: t.progress }))
    })
  }

  // 3. Analyze update frequency
  const daysWithUpdates = new Set(recentUpdates.map(u => 
    new Date(u.createdAt).toDateString()
  )).size
  
  if (daysWithUpdates < 3 && tasks.length > 0) {
    recommendations.push({
      id: 'low-update-frequency',
      priority: 'medium',
      type: 'activity',
      title: 'Low Update Frequency',
      message: `You've only logged updates on ${daysWithUpdates} day(s) this week. Regular updates help track progress and identify blockers early.`,
      action: 'add_update'
    })
  }

  // 4. Check for blocked tasks
  const blockedTasks = tasks.filter(t => t.status === 'blocked')
  if (blockedTasks.length > 0) {
    recommendations.push({
      id: 'blocked-tasks',
      priority: 'high',
      type: 'blocker',
      title: 'Blocked Tasks',
      message: `${blockedTasks.length} task(s) are blocked. Escalate if blockers persist beyond 24 hours.`,
      action: 'resolve_blockers',
      tasks: blockedTasks.map(t => ({ id: t._id, title: t.title, blockers: t.blockers }))
    })
  }

  // 5. Workload analysis
  const urgentHighPriority = tasks.filter(t => 
    ['urgent', 'high'].includes(t.priority) && t.status !== 'done'
  ).length
  
  if (urgentHighPriority > 5) {
    recommendations.push({
      id: 'high-workload',
      priority: 'high',
      type: 'workload',
      title: 'High Workload Detected',
      message: `You have ${urgentHighPriority} high-priority/urgent tasks. Consider discussing priorities with your manager.`,
      action: 'review_priorities'
    })
  }

  // 6. Check for stale tasks (no progress in 7 days)
  const staleTasks = tasks.filter(t => {
    const taskUpdates = recentUpdates.filter(u => u.task?.toString() === t._id.toString())
    return taskUpdates.length === 0 && t.status === 'in_progress'
  })
  
  if (staleTasks.length > 0) {
    recommendations.push({
      id: 'stale-tasks',
      priority: 'medium',
      type: 'progress',
      title: 'Stale Tasks',
      message: `${staleTasks.length} in-progress task(s) haven't been updated in 7 days.`,
      action: 'update_progress',
      tasks: staleTasks.map(t => ({ id: t._id, title: t.title }))
    })
  }

  // 7. AI Confidence warnings
  const lowConfidenceTasks = []
  for (const task of tasks) {
    const confidence = await calculateTaskConfidence(task._id)
    if (confidence && confidence.score < 50) {
      lowConfidenceTasks.push({
        id: task._id,
        title: task.title,
        confidence: confidence.score,
        riskLevel: confidence.riskLevel
      })
    }
  }
  
  if (lowConfidenceTasks.length > 0) {
    recommendations.push({
      id: 'low-confidence-tasks',
      priority: 'high',
      type: 'ai_insight',
      title: 'At-Risk Tasks',
      message: `AI analysis indicates ${lowConfidenceTasks.length} task(s) may not be completed on time.`,
      action: 'review_risks',
      tasks: lowConfidenceTasks
    })
  }

  // Sort by priority
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

  return recommendations
}

/**
 * Generate team-level insights for managers
 */
async function generateTeamInsights(managerId) {
  const insights = []

  // Get projects managed by this user
  const projects = await Project.find({
    $or: [
      { owner: managerId },
      { members: managerId }
    ],
    status: 'active'
  }).lean()

  for (const project of projects) {
    const health = await getProjectHealthSummary(project._id)
    
    if (health.riskLevel === 'critical' || health.riskLevel === 'high') {
      insights.push({
        id: `project-${project._id}`,
        type: 'project_health',
        priority: health.riskLevel,
        title: `Project at Risk: ${project.name}`,
        message: `${health.atRiskTasks} of ${health.taskCount} tasks are at risk. Overall health: ${health.overallHealth}%`,
        projectId: project._id,
        projectName: project.name,
        health
      })
    }
  }

  // Get team members' workload
  const teamTasks = await Task.aggregate([
    { 
      $match: { 
        project: { $in: projects.map(p => p._id) },
        status: { $nin: ['done'] }
      }
    },
    {
      $group: {
        _id: '$assignee',
        taskCount: { $sum: 1 },
        urgentCount: { 
          $sum: { $cond: [{ $eq: ['$priority', 'urgent'] }, 1, 0] }
        },
        blockedCount: {
          $sum: { $cond: [{ $eq: ['$status', 'blocked'] }, 1, 0] }
        }
      }
    }
  ])

  // Check for overloaded team members
  const overloadedMembers = teamTasks.filter(m => m.taskCount > 10 || m.urgentCount > 3)
  if (overloadedMembers.length > 0) {
    const userIds = overloadedMembers.map(m => m._id)
    const users = await User.find({ _id: { $in: userIds } }).select('name').lean()
    const userMap = Object.fromEntries(users.map(u => [u._id.toString(), u.name]))
    
    insights.push({
      id: 'overloaded-members',
      type: 'team_workload',
      priority: 'high',
      title: 'Overloaded Team Members',
      message: `${overloadedMembers.length} team member(s) have high workload.`,
      members: overloadedMembers.map(m => ({
        userId: m._id,
        name: userMap[m._id?.toString()] || 'Unknown',
        taskCount: m.taskCount,
        urgentCount: m.urgentCount
      }))
    })
  }

  // Check for team members with blocked tasks
  const membersWithBlockers = teamTasks.filter(m => m.blockedCount > 0)
  if (membersWithBlockers.length > 0) {
    const totalBlocked = membersWithBlockers.reduce((sum, m) => sum + m.blockedCount, 0)
    insights.push({
      id: 'team-blockers',
      type: 'team_blockers',
      priority: 'high',
      title: 'Team Blockers',
      message: `${totalBlocked} blocked task(s) across ${membersWithBlockers.length} team member(s).`,
      action: 'review_blockers'
    })
  }

  return insights
}

/**
 * Generate smart notification timing based on user patterns
 */
async function getOptimalNotificationTime(userId) {
  const user = await User.findById(userId)
  if (!user) return null

  // Check quiet hours
  if (user.isQuietHours()) {
    const prefs = user.notificationPreferences || {}
    return {
      shouldDelay: true,
      delayUntil: prefs.quietHoursEnd,
      reason: 'User is in quiet hours'
    }
  }

  // Analyze when user is most active
  const updates = await DailyUpdate.find({ author: userId })
    .select('createdAt')
    .sort('-createdAt')
    .limit(100)
    .lean()

  if (updates.length < 10) {
    return { shouldDelay: false, reason: 'Not enough data for pattern analysis' }
  }

  // Calculate most active hours
  const hourCounts = new Array(24).fill(0)
  updates.forEach(u => {
    const hour = new Date(u.createdAt).getHours()
    hourCounts[hour]++
  })

  const peakHour = hourCounts.indexOf(Math.max(...hourCounts))
  const currentHour = new Date().getHours()

  // If current hour is within 2 hours of peak, send now
  if (Math.abs(currentHour - peakHour) <= 2) {
    return { shouldDelay: false, reason: 'User is typically active now' }
  }

  return {
    shouldDelay: false,
    peakActivityHour: peakHour,
    recommendation: `User is most active around ${peakHour}:00`
  }
}

/**
 * Score notification priority for smart ordering
 */
function scoreNotificationPriority(notification, userContext = {}) {
  let score = 50 // Base score

  // Type-based scoring
  const typeScores = {
    'deadline_soon': 90,
    'task_assigned': 70,
    'ai_recommendation': 60,
    'eod_reminder': 50,
    'generic': 30
  }
  score = typeScores[notification.type] || score

  // Boost for unread
  if (!notification.read) score += 20

  // Recency boost (newer = higher)
  const ageHours = (Date.now() - new Date(notification.createdAt).getTime()) / (1000 * 60 * 60)
  if (ageHours < 1) score += 15
  else if (ageHours < 6) score += 10
  else if (ageHours > 24) score -= 10

  // Context-based adjustments
  if (userContext.hasOverdueTasks && notification.type === 'deadline_soon') {
    score += 10
  }

  return Math.max(0, Math.min(100, score))
}

module.exports = {
  generateUserRecommendations,
  generateTeamInsights,
  getOptimalNotificationTime,
  scoreNotificationPriority
}
