const { z } = require('zod')
const User = require('../models/User')
const Task = require('../models/Task')
const Project = require('../models/Project')
const DailyUpdate = require('../models/DailyUpdate')
const { signToken } = require('../utils/jwt')


const registerNewUser = async (req, res) => {
    try {

      
           const body = z.object({
            name: z.string().min(2),
            email: z.string().email(),
            password: z.string().min(6),
            role: z.enum(['admin', 'manager', 'dev']).optional(),
            skills: z.array(z.string()).optional(),
            workloadHours: z.number().min(0).optional()
            }).parse(req.body);


            const exists = await User.findOne({ email: body.email })
            if (exists) return res.status(409).json({ error: 'Email already in use' })


            const passwordHash = await User.hashPassword(body.password)
            const user = await User.create({
            name: body.name,
            email: body.email,
            role: body.role || 'dev',
            skills: body.skills || [],
            workloadHours: body.workloadHours || 40,
            passwordHash
            })
            const token = signToken(user)
            res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } })
        }
    catch (error) {
        return res.status(500).json({ error: 'Server error' , details: error.message })
    }
}



const loginUser = async (req, res) => {
    try {
        const body = z.object({ email: z.string().email(), password: z.string().min(1) }).parse(req.body)
        const user = await User.findOne({ email: body.email })
        if (!user) return res.status(401).json({ error: 'Invalid credentials' })
        if (!user.isActive) return res.status(401).json({ error: 'Account is deactivated' })
        const ok = await user.verifyPassword(body.password)
        if (!ok) return res.status(401).json({ error: 'Invalid credentials' })
        const token = signToken(user)
        res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } })
} catch (err) {
        res.status(400).json({ error: err.message })
    }
}

const getUsersBasedOnRole = async (req, res) => {
  try {
    const { role } = req.query; // ← query parameter
    const filter = { isActive: true };

    if (role) filter.role = role; // optional filter if provided

    const users = await User.find(filter).select('name email role skills workloadHours');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
}

// Get current user's profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash')
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json(user)
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message })
  }
}

// Update current user's profile
const updateUserProfile = async (req, res) => {
  try {
    const body = z.object({
      name: z.string().min(2).optional(),
      skills: z.array(z.string()).optional(),
      workloadHours: z.number().min(0).max(168).optional(),
      notificationPreferences: z.object({
        email: z.boolean().optional(),
        push: z.boolean().optional(),
        eodReminder: z.boolean().optional(),
        deadlineAlerts: z.boolean().optional(),
        taskAssignments: z.boolean().optional()
      }).optional()
    }).parse(req.body)

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: body },
      { new: true }
    ).select('-passwordHash')

    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json(user)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

// Change password
const changePassword = async (req, res) => {
  try {
    const body = z.object({
      currentPassword: z.string().min(1),
      newPassword: z.string().min(6)
    }).parse(req.body)

    const user = await User.findById(req.user.id)
    if (!user) return res.status(404).json({ error: 'User not found' })

    const isValid = await user.verifyPassword(body.currentPassword)
    if (!isValid) return res.status(401).json({ error: 'Current password is incorrect' })

    const passwordHash = await User.hashPassword(body.newPassword)
    user.passwordHash = passwordHash
    await user.save()

    res.json({ message: 'Password changed successfully' })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

// Get user statistics
const getUserStats = async (req, res) => {
  try {
    const userId = req.params.id || req.user.id

    // Get task statistics
    const taskStats = await Task.aggregate([
      { $match: { assignee: require('mongoose').Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ])

    // Format task stats
    const tasksByStatus = {
      todo: 0,
      in_progress: 0,
      blocked: 0,
      done: 0
    }
    taskStats.forEach(stat => {
      tasksByStatus[stat._id] = stat.count
    })

    const totalTasks = Object.values(tasksByStatus).reduce((a, b) => a + b, 0)
    const completionRate = totalTasks > 0 
      ? Math.round((tasksByStatus.done / totalTasks) * 100) 
      : 0

    // Get tasks by priority
    const priorityStats = await Task.aggregate([
      { $match: { assignee: require('mongoose').Types.ObjectId(userId), status: { $ne: 'done' } } },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ])

    const tasksByPriority = { low: 0, medium: 0, high: 0, urgent: 0 }
    priorityStats.forEach(stat => {
      tasksByPriority[stat._id] = stat.count
    })

    // Get overdue tasks
    const overdueTasks = await Task.countDocuments({
      assignee: userId,
      status: { $nin: ['done'] },
      dueDate: { $lt: new Date() }
    })

    // Get daily updates count (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const updateCount = await DailyUpdate.countDocuments({
      user: userId,
      createdAt: { $gte: thirtyDaysAgo }
    })

    // Get projects count
    const projectsCount = await Project.countDocuments({
      $or: [
        { owner: userId },
        { members: userId }
      ]
    })

    // Calculate average confidence score
    const tasksWithConfidence = await Task.find({
      assignee: userId,
      status: { $nin: ['done'] }
    }).select('aiConfidence')

    const avgConfidence = tasksWithConfidence.length > 0
      ? Math.round(tasksWithConfidence.reduce((sum, t) => sum + (t.aiConfidence || 100), 0) / tasksWithConfidence.length)
      : 100

    res.json({
      tasksByStatus,
      tasksByPriority,
      totalTasks,
      activeTasks: totalTasks - tasksByStatus.done,
      completionRate,
      overdueTasks,
      recentUpdates: updateCount,
      projectsCount,
      avgConfidence
    })
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message })
  }
}

// Deactivate user account (admin only)
const deactivateUser = async (req, res) => {
  try {
    // Only admin can deactivate users
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' })
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    ).select('-passwordHash')

    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json({ message: 'User deactivated successfully', user })
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message })
  }
}

// Reactivate user account (admin only)
const reactivateUser = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' })
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: true },
      { new: true }
    ).select('-passwordHash')

    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json({ message: 'User reactivated successfully', user })
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message })
  }
}

// Get user by ID (admin/manager)
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash')
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json(user)
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message })
  }
}

// Update user role (admin only)
const updateUserRole = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' })
    }

    const body = z.object({
      role: z.enum(['admin', 'manager', 'dev'])
    }).parse(req.body)

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: body.role },
      { new: true }
    ).select('-passwordHash')

    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json(user)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

// Admin create user
const adminCreateUser = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' })
    }

    const body = z.object({
      name: z.string().min(2),
      email: z.string().email(),
      password: z.string().min(6),
      role: z.enum(['admin', 'manager', 'dev']).optional(),
    }).parse(req.body)

    const exists = await User.findOne({ email: body.email })
    if (exists) return res.status(409).json({ error: 'Email already in use' })

    const passwordHash = await User.hashPassword(body.password)
    const user = await User.create({
      name: body.name,
      email: body.email,
      role: body.role || 'dev',
      passwordHash
    })

    res.status(201).json({ 
      _id: user._id, 
      name: user.name, 
      email: user.email, 
      role: user.role,
      createdAt: user.createdAt 
    })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

// Admin update user
const adminUpdateUser = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' })
    }

    const body = z.object({
      name: z.string().min(2).optional(),
      email: z.string().email().optional(),
      password: z.string().min(6).optional(),
      role: z.enum(['admin', 'manager', 'dev']).optional(),
    }).parse(req.body)

    const updateData = {}
    if (body.name) updateData.name = body.name
    if (body.email) updateData.email = body.email
    if (body.role) updateData.role = body.role
    if (body.password) {
      updateData.passwordHash = await User.hashPassword(body.password)
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    ).select('-passwordHash')

    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json(user)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

// Admin delete user
const adminDeleteUser = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' })
    }

    // Don't allow deleting yourself
    if (req.params.id === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' })
    }

    const user = await User.findByIdAndDelete(req.params.id)
    if (!user) return res.status(404).json({ error: 'User not found' })

    // Optionally: Unassign tasks from this user
    await Task.updateMany(
      { assignee: req.params.id },
      { $unset: { assignee: 1 } }
    )

    res.json({ message: 'User deleted successfully' })
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message })
  }
}

module.exports = {
    registerNewUser,
    loginUser,
    getUsersBasedOnRole,
    getUserProfile,
    updateUserProfile,
    changePassword,
    getUserStats,
    deactivateUser,
    reactivateUser,
    getUserById,
    updateUserRole,
    adminCreateUser,
    adminUpdateUser,
    adminDeleteUser
}