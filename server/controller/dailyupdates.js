
const {z} = require('zod');
const DailyUpdate = require('../models/DailyUpdate');
const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');
const { scoreConfidence } = require('../services/aiConfidence');
const { notifyUser } = require('../utils/notify');


const createDailyUpdate = async (req, res) => {
try {
    const body = z.object({
    task: z.string(),
    note: z.string().optional(),
    progress: z.number().min(0).max(100).optional(),
    blockers: z.array(z.string()).optional()
    }).parse(req.body)


    const task = await Task.findById(body.task).populate('project')
    if (!task) return res.status(404).json({ error: 'Task not found' })
    
    if (task.assignee?.toString() !== req.user.id && req.user.role === 'dev') {
    return res.status(403).json({ error: 'Cannot update someone else\'s task' })
    }


    const update = await DailyUpdate.create({
    task: task._id,
    author: req.user.id,
    note: body.note,
    progress: body.progress,
    blockers: body.blockers
    })


    // Persist to task
    if (typeof body.progress === 'number') task.progress = body.progress
    if (body.blockers?.length) task.blockers = body.blockers


    // Re-score AI confidence (placeholder logic)
    const aiConfidence = await scoreConfidence(task)
    task.aiConfidence = aiConfidence.score
    await task.save()

    // Notify manager/project owner about the update
    const io = req.app.get('io')
    if (io && task.project) {
      const project = await Project.findById(task.project._id || task.project)
      if (project && project.owner && project.owner.toString() !== req.user.id) {
        const author = await User.findById(req.user.id).select('name')
        await notifyUser(io, {
          userId: project.owner,
          type: 'task_update',
          title: 'Task Update Received',
          message: `${author?.name || 'A team member'} submitted an update on "${task.title}" - Progress: ${task.progress}%`,
          actionUrl: `/tasks/${task._id}`,
          meta: { taskId: task._id, progress: task.progress }
        })
      }
    }


res.status(201).json({ update, task })
} catch (err) { res.status(400).json({ error: err.message }) }
}

// Get all updates for a task
const getTaskUpdates = async (req, res) => {
  try {
    const { taskId } = req.params
    const updates = await DailyUpdate.find({ task: taskId })
      .populate('author', 'name email')
      .sort('-createdAt')
    
    res.json(updates)
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message })
  }
}

// Get task journey with AI analysis
const getTaskJourney = async (req, res) => {
  try {
    const { taskId } = req.params
    
    const task = await Task.findById(taskId)
      .populate('assignee', 'name email')
      .populate('project', 'name key owner')
    
    if (!task) return res.status(404).json({ error: 'Task not found' })
    
    const updates = await DailyUpdate.find({ task: taskId })
      .populate('author', 'name')
      .sort('createdAt')
    
    // Build progress timeline
    const timeline = updates.map((u, idx) => ({
      date: u.createdAt,
      author: u.author?.name || 'Unknown',
      note: u.note,
      progress: u.progress,
      blockers: u.blockers || [],
      progressDelta: idx > 0 && updates[idx-1].progress != null && u.progress != null 
        ? u.progress - updates[idx-1].progress 
        : 0
    }))
    
    // Calculate velocity (average progress per update)
    const progressUpdates = updates.filter(u => u.progress != null)
    const velocity = progressUpdates.length > 1
      ? (task.progress - (progressUpdates[0]?.progress || 0)) / progressUpdates.length
      : 0
    
    // Get current AI confidence
    const confidence = await scoreConfidence(task)
    
    // Summary stats
    const totalUpdates = updates.length
    const daysActive = updates.length > 0
      ? Math.ceil((new Date() - new Date(updates[0].createdAt)) / (1000 * 60 * 60 * 24))
      : 0
    const allBlockers = [...new Set(updates.flatMap(u => u.blockers || []))]
    
    res.json({
      task: {
        _id: task._id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        progress: task.progress,
        dueDate: task.dueDate,
        assignee: task.assignee,
        project: task.project,
        blockers: task.blockers
      },
      journey: {
        timeline,
        summary: {
          totalUpdates,
          daysActive,
          currentProgress: task.progress,
          velocity: Math.round(velocity * 10) / 10,
          allBlockers
        }
      },
      aiAnalysis: confidence
    })
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message })
  }
}

module.exports = { createDailyUpdate, getTaskUpdates, getTaskJourney };