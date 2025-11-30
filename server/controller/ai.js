const geminiAI = require('../services/geminiAI')
const { z } = require('zod')

/**
 * Get AI status
 */
const getAIStatus = async (req, res) => {
  try {
    res.json({
      enabled: geminiAI.isAvailable(),
      available: geminiAI.isAvailable(),
      provider: 'gemini',
      model: 'gemini-2.5-flash',
      features: [
        'dailyInsights',
        'blockerAnalysis',
        'teamSummary',
        'sprintRetrospective',
        'taskEstimation',
        'updateEnhancement'
      ]
    })
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message })
  }
}

/**
 * Get personalized daily insights for current user
 */
const getDailyInsights = async (req, res) => {
  try {
    if (!geminiAI.isAvailable()) {
      return res.status(503).json({ 
        error: 'AI service unavailable',
        message: 'Gemini AI is not configured. Please set GEMINI_API_KEY.'
      })
    }

    const result = await geminiAI.generateDailyInsights(req.user.id)
    
    if (result.error) {
      return res.status(500).json({ error: result.error })
    }

    res.json(result)
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message })
  }
}

/**
 * Analyze blockers for a specific task
 */
const analyzeTaskBlockers = async (req, res) => {
  try {
    if (!geminiAI.isAvailable()) {
      return res.status(503).json({ 
        error: 'AI service unavailable',
        message: 'Gemini AI is not configured.'
      })
    }

    const { taskId } = req.params
    const result = await geminiAI.analyzeBlockers(taskId)
    
    if (result.error) {
      return res.status(500).json({ error: result.error })
    }

    res.json(result)
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message })
  }
}

/**
 * Get team summary for managers
 */
const getTeamSummary = async (req, res) => {
  try {
    // Only managers and admins can access team summaries
    if (!['manager', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Manager access required' })
    }

    if (!geminiAI.isAvailable()) {
      return res.status(503).json({ 
        error: 'AI service unavailable',
        message: 'Gemini AI is not configured.'
      })
    }

    const result = await geminiAI.generateTeamSummary(req.user.id)
    
    if (result.error) {
      return res.status(500).json({ error: result.error })
    }

    res.json(result)
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message })
  }
}

/**
 * Generate sprint retrospective
 */
const getSprintRetrospective = async (req, res) => {
  try {
    if (!geminiAI.isAvailable()) {
      return res.status(503).json({ 
        error: 'AI service unavailable',
        message: 'Gemini AI is not configured.'
      })
    }

    const schema = z.object({
      projectId: z.string(),
      startDate: z.string().datetime().optional(),
      endDate: z.string().datetime().optional()
    })

    const { projectId, startDate, endDate } = schema.parse(req.query)
    
    // Default to last 2 weeks if dates not provided
    const end = endDate ? new Date(endDate) : new Date()
    const start = startDate ? new Date(startDate) : new Date(end.getTime() - 14 * 24 * 60 * 60 * 1000)

    const result = await geminiAI.generateSprintRetrospective(projectId, start, end)
    
    if (result.error) {
      return res.status(500).json({ error: result.error })
    }

    res.json(result)
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message })
  }
}

/**
 * Get AI estimation for a new task
 */
const estimateTask = async (req, res) => {
  try {
    if (!geminiAI.isAvailable()) {
      return res.status(503).json({ 
        error: 'AI service unavailable',
        message: 'Gemini AI is not configured.'
      })
    }

    const schema = z.object({
      title: z.string().min(2),
      description: z.string().optional(),
      priority: z.enum(['low', 'medium', 'high', 'urgent']).optional()
    })

    const taskDetails = schema.parse(req.body)
    const userId = req.body.assigneeId || req.user.id

    const result = await geminiAI.estimateTaskDuration(taskDetails, userId)
    
    if (result.error) {
      return res.status(500).json({ error: result.error })
    }

    // Normalize the response for frontend
    const estimate = result.estimate || {}
    res.json({
      estimatedHours: (estimate.estimatedDays || 1) * 8,
      estimatedDays: estimate.estimatedDays || 1,
      confidence: estimate.confidenceLevel === 'high' ? 90 : estimate.confidenceLevel === 'medium' ? 70 : 50,
      complexity: estimate.estimatedDays <= 1 ? 'low' : estimate.estimatedDays <= 3 ? 'medium' : 'high',
      suggestion: estimate.reasoning || estimate.tips?.[0],
      suggestedDeadline: estimate.suggestedDeadline,
      riskFactors: estimate.riskFactors,
      estimate: estimate
    })
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message })
  }
}

/**
 * Enhance a daily update with AI
 */
const enhanceUpdate = async (req, res) => {
  try {
    if (!geminiAI.isAvailable()) {
      return res.status(503).json({ 
        error: 'AI service unavailable',
        message: 'Gemini AI is not configured.'
      })
    }

    const schema = z.object({
      updateText: z.string().min(1),
      taskTitle: z.string()
    })

    const { updateText, taskTitle } = schema.parse(req.body)

    const result = await geminiAI.enhanceDailyUpdate(updateText, { title: taskTitle })
    
    // Normalize response for frontend
    res.json({
      enhancedText: result.enhanced || updateText,
      keyPoints: result.keyPoints || [],
      suggestedNextSteps: result.suggestedNextSteps || []
    })
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message })
  }
}

module.exports = {
  getAIStatus,
  getDailyInsights,
  analyzeTaskBlockers,
  getTeamSummary,
  getSprintRetrospective,
  estimateTask,
  enhanceUpdate
}
