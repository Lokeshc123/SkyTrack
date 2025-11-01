
const {z} = require('zod');
const DailyUpdate = require('../models/DailyUpdate');
const Task = require('../models/Task');
const { scoreConfidence } = require('../services/aiConfidence');


const createDailyUpdate = async (req, res) => {
try {
    const body = z.object({
    task: z.string(),
    note: z.string().optional(),
    progress: z.number().min(0).max(100).optional(),
    blockers: z.array(z.string()).optional()
    }).parse(req.body)


    const task = await Task.findById(body.task)
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
    task.aiConfidence = aiConfidence
    await task.save()


res.status(201).json({ update, task })
} catch (err) { res.status(400).json({ error: err.message }) }
}

module.exports = { createDailyUpdate };