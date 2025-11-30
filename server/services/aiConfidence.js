const Task = require('../models/Task')
const DailyUpdate = require('../models/DailyUpdate')

/**
 * Calculate AI confidence score for a task with detailed breakdown
 * @param {Object} taskDoc - Task document
 * @param {Object} options - Additional options like historical data
 * @returns {Object} - Confidence score and analysis
 */
function scoreConfidence(taskDoc, options = {}) {
  const now = Date.now()
  const due = taskDoc.dueDate ? new Date(taskDoc.dueDate).getTime() : null
  const start = taskDoc.startDate ? new Date(taskDoc.startDate).getTime() : null
  const daysLeft = due ? Math.max(0, (due - now) / (1000 * 60 * 60 * 24)) : 14
  const totalDuration = (due && start) ? (due - start) / (1000 * 60 * 60 * 24) : 14
  const elapsed = start ? Math.max(0, (now - start) / (1000 * 60 * 60 * 24)) : 0

  // Breakdown of confidence factors
  const factors = {
    timeScore: 25,      // Max 25 points for time management
    progressScore: 25,  // Max 25 points for progress
    blockerScore: 25,   // Max 25 points (penalty for blockers)
    dependencyScore: 15, // Max 15 points for dependencies
    activityScore: 10   // Max 10 points for recent activity
  }

  // 1. Time Score - Based on remaining time vs expected progress
  const expectedProgress = totalDuration > 0 ? Math.min(100, (elapsed / totalDuration) * 100) : 0
  const actualProgress = taskDoc.progress || 0
  const progressDelta = actualProgress - expectedProgress

  if (daysLeft <= 0) {
    factors.timeScore = taskDoc.status === 'done' ? 25 : 0
  } else if (daysLeft <= 1) {
    factors.timeScore = actualProgress >= 90 ? 20 : 5
  } else if (daysLeft <= 3) {
    factors.timeScore = actualProgress >= 70 ? 22 : 10
  } else {
    factors.timeScore = Math.min(25, 15 + (daysLeft > 7 ? 10 : daysLeft))
  }

  // 2. Progress Score - Based on actual completion
  factors.progressScore = Math.round((actualProgress / 100) * 25)

  // 3. Blocker Score - Penalties for blockers
  const blockerCount = taskDoc.blockers?.length || 0
  factors.blockerScore = Math.max(0, 25 - (blockerCount * 8))

  // 4. Dependency Score - Check if dependencies are completed
  const totalDeps = taskDoc.dependencies?.length || 0
  const completedDeps = options.completedDependencies || 0
  if (totalDeps > 0) {
    factors.dependencyScore = Math.round((completedDeps / totalDeps) * 15)
  }

  // 5. Activity Score - Based on recent updates (from options)
  const recentUpdates = options.recentUpdateCount || 0
  factors.activityScore = Math.min(10, recentUpdates * 2)

  // Calculate total score
  const totalScore = Object.values(factors).reduce((sum, val) => sum + val, 0)
  const score = Math.max(0, Math.min(100, totalScore))

  // Determine risk level
  let riskLevel = 'low'
  if (score < 40) riskLevel = 'critical'
  else if (score < 60) riskLevel = 'high'
  else if (score < 80) riskLevel = 'medium'

  // Generate recommendations
  const recommendations = generateRecommendations(taskDoc, factors, daysLeft, progressDelta)

  return {
    score,
    riskLevel,
    factors,
    recommendations,
    analysis: {
      daysRemaining: Math.round(daysLeft * 10) / 10,
      expectedProgress: Math.round(expectedProgress),
      actualProgress,
      progressDelta: Math.round(progressDelta),
      blockerCount,
      dependencyStatus: totalDeps > 0 ? `${completedDeps}/${totalDeps}` : 'none'
    }
  }
}

/**
 * Generate actionable recommendations based on task analysis
 */
function generateRecommendations(taskDoc, factors, daysLeft, progressDelta) {
  const recommendations = []

  // Time-based recommendations
  if (daysLeft <= 1 && taskDoc.progress < 90) {
    recommendations.push({
      priority: 'critical',
      type: 'deadline',
      message: 'Task is due very soon with low completion. Consider requesting deadline extension or additional resources.',
      action: 'request_extension'
    })
  } else if (daysLeft <= 3 && taskDoc.progress < 70) {
    recommendations.push({
      priority: 'high',
      type: 'deadline',
      message: 'Task may not be completed on time. Increase focus or break down remaining work.',
      action: 'increase_priority'
    })
  }

  // Progress-based recommendations
  if (progressDelta < -20) {
    recommendations.push({
      priority: 'high',
      type: 'progress',
      message: `Progress is ${Math.abs(Math.round(progressDelta))}% behind schedule. Consider daily check-ins.`,
      action: 'schedule_checkin'
    })
  }

  // Blocker recommendations
  if (taskDoc.blockers?.length > 0) {
    recommendations.push({
      priority: 'high',
      type: 'blocker',
      message: `${taskDoc.blockers.length} blocker(s) identified. Address blockers to improve velocity.`,
      action: 'resolve_blockers',
      blockers: taskDoc.blockers
    })
  }

  // Activity recommendations
  if (factors.activityScore < 4) {
    recommendations.push({
      priority: 'medium',
      type: 'activity',
      message: 'Low recent activity on this task. Add daily updates to track progress.',
      action: 'add_update'
    })
  }

  // Status-based recommendations
  if (taskDoc.status === 'blocked') {
    recommendations.push({
      priority: 'critical',
      type: 'status',
      message: 'Task is marked as blocked. Escalate to manager if not resolved within 24 hours.',
      action: 'escalate'
    })
  }

  return recommendations
}

/**
 * Calculate confidence for a task with full context from database
 */
async function calculateTaskConfidence(taskId) {
  const task = await Task.findById(taskId).populate('dependencies')
  if (!task) return null

  // Get completed dependencies count
  const completedDependencies = task.dependencies?.filter(d => d.status === 'done').length || 0

  // Get recent update count (last 7 days)
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const recentUpdateCount = await DailyUpdate.countDocuments({
    task: taskId,
    createdAt: { $gte: weekAgo }
  })

  return scoreConfidence(task, {
    completedDependencies,
    recentUpdateCount
  })
}

/**
 * Batch calculate confidence for multiple tasks
 */
async function calculateBatchConfidence(taskIds) {
  const results = {}
  for (const taskId of taskIds) {
    results[taskId] = await calculateTaskConfidence(taskId)
  }
  return results
}

/**
 * Get project health summary based on all tasks
 */
async function getProjectHealthSummary(projectId) {
  const tasks = await Task.find({ project: projectId, status: { $ne: 'done' } })
  
  if (tasks.length === 0) {
    return {
      overallHealth: 100,
      riskLevel: 'low',
      taskCount: 0,
      summary: 'No active tasks'
    }
  }

  const confidenceScores = []
  const riskBreakdown = { critical: 0, high: 0, medium: 0, low: 0 }

  for (const task of tasks) {
    const confidence = await calculateTaskConfidence(task._id)
    if (confidence) {
      confidenceScores.push(confidence.score)
      riskBreakdown[confidence.riskLevel]++
    }
  }

  const avgScore = confidenceScores.length > 0 
    ? Math.round(confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length)
    : 100

  let overallRisk = 'low'
  if (riskBreakdown.critical > 0) overallRisk = 'critical'
  else if (riskBreakdown.high > tasks.length * 0.3) overallRisk = 'high'
  else if (riskBreakdown.medium > tasks.length * 0.5) overallRisk = 'medium'

  return {
    overallHealth: avgScore,
    riskLevel: overallRisk,
    taskCount: tasks.length,
    riskBreakdown,
    atRiskTasks: tasks.filter((_, i) => confidenceScores[i] < 60).length
  }
}

module.exports = { 
  scoreConfidence, 
  calculateTaskConfidence, 
  calculateBatchConfidence,
  getProjectHealthSummary,
  generateRecommendations 
}