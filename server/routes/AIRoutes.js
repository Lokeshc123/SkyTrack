const express = require('express')
const { requireAuth } = require('../middleware/auth')
const {
  getAIStatus,
  getDailyInsights,
  analyzeTaskBlockers,
  getTeamSummary,
  getSprintRetrospective,
  estimateTask,
  enhanceUpdate
} = require('../controller/ai')

const router = express.Router()

// Get AI service status
router.get('/status', requireAuth, getAIStatus)

// Get personalized daily insights
router.get('/insights/daily', requireAuth, getDailyInsights)

// Analyze blockers for a task
router.get('/analyze/blockers/:taskId', requireAuth, analyzeTaskBlockers)

// Get team summary (manager/admin only)
router.get('/insights/team', requireAuth, getTeamSummary)

// Get sprint retrospective
router.get('/retrospective', requireAuth, getSprintRetrospective)

// Estimate task duration
router.post('/estimate', requireAuth, estimateTask)

// Enhance daily update text
router.post('/enhance-update', requireAuth, enhanceUpdate)

module.exports = router
