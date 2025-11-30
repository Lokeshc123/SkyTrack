const Notification = require('../models/Notification')
const Task = require('../models/Task')
const mongoose = require('mongoose')
const { calculateTaskConfidence } = require('../services/aiConfidence')



const getNotificationsForUser = async (req, res) => {
try {
    const page = Math.max(1, Number(req.query.page) || 1)
    const limit = Math.min(50, Number(req.query.limit) || 20)
    const filter = { user: req.user.id }
    
    // Optional filters
    if (req.query.type) filter.type = req.query.type
    if (req.query.read === 'true') filter.read = true
    if (req.query.read === 'false') filter.read = false

    const [items, total] = await Promise.all([
      Notification.find(filter)
        .sort('-createdAt')
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Notification.countDocuments(filter)
    ])
    
    res.json({
      notifications: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (e) {
    res.status(500).json({ error: 'Server error', details: e.message })
  }
}


const markNotificationAsRead = async (req, res) => {
    try {
     const doc = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    { read: true, seenAt: new Date() },
    { new: true }
  )
  if (!doc) return res.status(404).json({ error: 'Not found' })
  res.status(200).json(doc)
} catch (e) {
  res.status(500).json({ error: 'Server error', details: e.message })
}
}

const markAllNotificationsAsRead = async (req, res) => {
    try {
  const result = await Notification.updateMany(
    { user: req.user.id, read: false }, 
    { read: true, seenAt: new Date() }
  )
  res.status(200).json({ ok: true, modifiedCount: result.modifiedCount })
} catch (e) {
  res.status(500).json({ error: 'Server error', details: e.message })
}
}

// Get unread notification count
const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ 
      user: req.user.id, 
      read: false 
    })
    
    // Get counts by type
    const countsByType = await Notification.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(req.user.id), read: false } },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ])

    const byType = {}
    countsByType.forEach(item => {
      byType[item._id] = item.count
    })

    res.json({ 
      total: count,
      byType
    })
  } catch (e) {
    res.status(500).json({ error: 'Server error', details: e.message })
  }
}

// Delete a notification
const deleteNotification = async (req, res) => {
  try {
    const doc = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    })
    if (!doc) return res.status(404).json({ error: 'Not found' })
    res.status(200).json({ ok: true, message: 'Notification deleted' })
  } catch (e) {
    res.status(500).json({ error: 'Server error', details: e.message })
  }
}

// Delete all read notifications
const deleteReadNotifications = async (req, res) => {
  try {
    const result = await Notification.deleteMany({
      user: req.user.id,
      read: true
    })
    res.status(200).json({ ok: true, deletedCount: result.deletedCount })
  } catch (e) {
    res.status(500).json({ error: 'Server error', details: e.message })
  }
}

// Get AI-powered recommendations for the user
const getAIRecommendations = async (req, res) => {
  try {
    // Get user's active tasks
    const tasks = await Task.find({
      assignee: req.user.id,
      status: { $nin: ['done'] }
    }).populate('dependencies').lean()

    if (tasks.length === 0) {
      return res.json({
        recommendations: [],
        summary: 'No active tasks found'
      })
    }

    const allRecommendations = []
    const taskAnalysis = []

    for (const task of tasks) {
      const confidence = await calculateTaskConfidence(task._id)
      if (confidence) {
        taskAnalysis.push({
          taskId: task._id,
          title: task.title,
          confidence: confidence.score,
          riskLevel: confidence.riskLevel,
          analysis: confidence.analysis
        })

        // Add task-specific recommendations
        confidence.recommendations.forEach(rec => {
          allRecommendations.push({
            ...rec,
            taskId: task._id,
            taskTitle: task.title
          })
        })
      }
    }

    // Sort recommendations by priority
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
    allRecommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

    // Calculate summary statistics
    const atRiskCount = taskAnalysis.filter(t => t.confidence < 60).length
    const avgConfidence = Math.round(
      taskAnalysis.reduce((sum, t) => sum + t.confidence, 0) / taskAnalysis.length
    )

    // Generate overall recommendations
    const overallRecommendations = []
    
    if (atRiskCount > tasks.length * 0.5) {
      overallRecommendations.push({
        priority: 'critical',
        type: 'workload',
        message: `${atRiskCount} of ${tasks.length} tasks are at risk. Consider discussing workload with your manager.`
      })
    }

    const blockedTasks = tasks.filter(t => t.status === 'blocked')
    if (blockedTasks.length > 0) {
      overallRecommendations.push({
        priority: 'high',
        type: 'blockers',
        message: `You have ${blockedTasks.length} blocked task(s). Prioritize resolving blockers.`
      })
    }

    const urgentTasks = tasks.filter(t => t.priority === 'urgent' && t.status !== 'done')
    if (urgentTasks.length > 0) {
      overallRecommendations.push({
        priority: 'high',
        type: 'priority',
        message: `${urgentTasks.length} urgent task(s) require immediate attention.`
      })
    }

    res.json({
      recommendations: allRecommendations.slice(0, 10), // Top 10 recommendations
      overallRecommendations,
      taskAnalysis,
      summary: {
        totalTasks: tasks.length,
        atRiskTasks: atRiskCount,
        avgConfidence,
        blockedTasks: blockedTasks.length
      }
    })
  } catch (e) {
    res.status(500).json({ error: 'Server error', details: e.message })
  }
}

// Get task confidence analysis
const getTaskConfidenceAnalysis = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId)
    if (!task) return res.status(404).json({ error: 'Task not found' })

    const confidence = await calculateTaskConfidence(req.params.taskId)
    if (!confidence) {
      return res.status(500).json({ error: 'Failed to calculate confidence' })
    }

    res.json({
      taskId: task._id,
      title: task.title,
      status: task.status,
      ...confidence
    })
  } catch (e) {
    res.status(500).json({ error: 'Server error', details: e.message })
  }
}

// Create a custom notification (for admin/system use)
const createNotification = async (req, res) => {
  try {
    const { z } = require('zod')
    const body = z.object({
      userId: z.string(),
      type: z.enum(['task_assigned', 'eod_reminder', 'deadline_soon', 'generic', 'ai_recommendation']).optional(),
      title: z.string().min(1),
      message: z.string().min(1),
      actionUrl: z.string().optional(),
      meta: z.object({}).passthrough().optional()
    }).parse(req.body)

    // Only admin/manager can create notifications for others
    if (req.user.role === 'dev' && body.userId !== req.user.id) {
      return res.status(403).json({ error: 'Cannot create notifications for other users' })
    }

    const notification = await Notification.create({
      user: body.userId,
      type: body.type || 'generic',
      title: body.title,
      message: body.message,
      actionUrl: body.actionUrl,
      meta: body.meta
    })

    // Emit via socket if available
    const io = req.app.get('io')
    if (io) {
      io.to(`user:${body.userId}`).emit('notification:new', {
        _id: notification._id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        actionUrl: notification.actionUrl,
        createdAt: notification.createdAt
      })
    }

    res.status(201).json(notification)
  } catch (e) {
    res.status(400).json({ error: e.message })
  }
}


module.exports = {
  getNotificationsForUser,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadCount,
  deleteNotification,
  deleteReadNotifications,
  getAIRecommendations,
  getTaskConfidenceAnalysis,
  createNotification
}