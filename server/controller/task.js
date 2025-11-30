
const {z} = require('zod');
const Task = require('../models/Task');
const Project = require('../models/Project');
const { notifyUser } = require('../utils/notify');

const TaskInput = z.object({
project: z.string(),
title: z.string().min(2),
description: z.string().optional(),
assignee: z.string().optional(),
priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
startDate: z.string().optional(),
dueDate: z.string().optional(),
dependencies: z.array(z.string()).optional()
})


const createTask = async (req, res) => {
try
 {
        const body = TaskInput.parse(req.body)
        console.log('Creating task with data:', body);
        const project = await Project.findById(body.project)
        if (!project) return res.status(404).json({ error: 'Project not found' })
        const task = await Task.create({
        project: body.project,
        title: body.title,
        description: body.description,
        assignee: body.assignee,
        priority: body.priority || 'medium',
        startDate: body.startDate,
        dueDate: body.dueDate,
        dependencies: body.dependencies || [],
        createdBy: req.user.id
        })
        res.status(201).json(task)
        if (task.assignee) {
        const io = req.app.get('io')
        await notifyUser(io, {
            userId: task.assignee,
            type: 'task_assigned',
            title: 'New task assigned',
            message: `“${task.title}” was assigned to you.`,
            actionUrl: `/tasks/${task._id}`
        })
        }
} 
catch (err) 
{ 
    res.status(400).json({ error: err.message })
 }
}


const getTasks = async (req, res) => {
    try 
    {
    const { project, assignee, status } = req.query
    const q = {}
    if (project) q.project = project
    if (assignee) q.assignee = assignee
    if (status) q.status = status
    const tasks = await Task.find(q)
        .populate('project', 'name')
        .populate('assignee', 'name email')
        .sort('-createdAt')
    res.status(200).json(tasks)
    } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message })
    }
}

const getMyTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ assignee: req.user.id })
            .populate('project', 'name')
            .populate('assignee', 'name email')
            .sort('-createdAt')
        res.status(200).json(tasks)
    } catch (err) {
        res.status(500).json({ error: 'Server error', details: err.message })
    }
}

const getTaskById = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
            .populate('project', 'name')
            .populate('assignee', 'name email')
            .populate('createdBy', 'name email')
        
        if (!task) {
            return res.status(404).json({ error: 'Task not found' })
        }
        
        res.status(200).json(task)
    } catch (err) {
        res.status(500).json({ error: 'Server error', details: err.message })
    }
}

const updateTask = async (req, res) => {
  try {
 
    const body = z.object({
      title: z.string().min(2).optional(),
      description: z.string().optional(),
      assignee: z.string().optional(),
      priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
      status: z.enum(['todo', 'in_progress', 'blocked', 'done']).optional(),
      startDate: z.string().datetime().optional(),
      dueDate: z.string().datetime().optional(),
      progress: z.number().min(0).max(100).optional(),
      blockers: z.array(z.string()).optional(),
    }).parse(req.body)

   
    const existingTask = await Task.findById(req.params.id)
    if (!existingTask) return res.status(404).json({ error: 'Task not found' })

    const oldAssignee = existingTask.assignee?.toString()
    const newAssignee = body.assignee

   
    const updatedTask = await Task.findByIdAndUpdate(req.params.id, body, { new: true })

   
    if (newAssignee && oldAssignee !== newAssignee) {
   
     
      const io = req.app.get('io')
      if (io) {
        const { notifyUser } = require('../utils/notify')
        await notifyUser(io, {
          userId: newAssignee,
          type: 'task_assigned',
          title: 'New Task Assigned',
          message: `You’ve been assigned to “${updatedTask.title}”.`,
          actionUrl: `/tasks/${updatedTask._id}`
        })
      }
    }

    res.status(200).json(updatedTask)
  } catch (err) {
    console.error(err)
    res.status(400).json({ error: err.message })
  }
}



module.exports = { createTask, getTasks, getMyTasks, getTaskById, updateTask };