const { GoogleGenerativeAI } = require('@google/generative-ai')
const Task = require('../models/Task')
const User = require('../models/User')
const DailyUpdate = require('../models/DailyUpdate')
const Project = require('../models/Project')

// Initialize Gemini
let genAI = null
let model = null

function initializeGemini() {
  if (!process.env.GEMINI_API_KEY) {
    console.warn('[GeminiAI] GEMINI_API_KEY not set - AI features will be disabled')
    return false
  }
  
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
  console.log('[GeminiAI] Initialized successfully')
  return true
}

/**
 * Check if Gemini is available
 */
function isAvailable() {
  return model !== null
}

/**
 * Generate personalized daily insights for a user using Gemini
 */
async function generateDailyInsights(userId) {
  if (!isAvailable()) {
    return { error: 'Gemini AI not configured', insights: null }
  }

  try {
    // Gather user context
    const user = await User.findById(userId).select('name role skills').lean()
    const tasks = await Task.find({ 
      assignee: userId, 
      status: { $nin: ['done'] } 
    }).select('title description priority status progress dueDate blockers').lean()
    
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const recentUpdates = await DailyUpdate.find({
      author: userId,
      createdAt: { $gte: weekAgo }
    }).select('note progress blockers date').lean()

    if (tasks.length === 0) {
      return { insights: 'No active tasks to analyze.', suggestions: [] }
    }

    const prompt = `You are a project management AI assistant. Analyze the following developer's workload and provide actionable insights.

USER: ${user.name} (${user.role})
Skills: ${user.skills?.join(', ') || 'Not specified'}

ACTIVE TASKS (${tasks.length}):
${tasks.map(t => `- "${t.title}" [${t.priority}/${t.status}] Progress: ${t.progress}% ${t.dueDate ? `Due: ${new Date(t.dueDate).toLocaleDateString()}` : ''} ${t.blockers?.length ? `Blockers: ${t.blockers.join(', ')}` : ''}`).join('\n')}

RECENT UPDATES (last 7 days): ${recentUpdates.length} updates
${recentUpdates.slice(0, 5).map(u => `- ${u.note || 'No note'} (Progress: ${u.progress}%)`).join('\n')}

Provide a JSON response with:
{
  "summary": "Brief 1-2 sentence overview of their current situation",
  "topPriority": "What they should focus on RIGHT NOW",
  "riskAlert": "Any immediate risks or concerns (or null if none)",
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"],
  "motivationalNote": "Brief encouraging message based on their progress"
}

Be specific, actionable, and concise.`

    const result = await model.generateContent(prompt)
    const response = result.response.text()
    
    // Parse JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const insights = JSON.parse(jsonMatch[0])
      return { insights, raw: response }
    }
    
    return { insights: response, suggestions: [] }
  } catch (error) {
    console.error('[GeminiAI] Error generating daily insights:', error.message)
    return { error: error.message, insights: null }
  }
}

/**
 * Analyze blockers and suggest solutions
 */
async function analyzeBlockers(taskId) {
  if (!isAvailable()) {
    return { error: 'Gemini AI not configured' }
  }

  try {
    const task = await Task.findById(taskId)
      .populate('assignee', 'name skills')
      .populate('project', 'name')
      .lean()

    if (!task || !task.blockers?.length) {
      return { analysis: null, message: 'No blockers to analyze' }
    }

    const prompt = `Analyze these blockers for a software development task and suggest solutions:

TASK: "${task.title}"
PROJECT: ${task.project?.name || 'Unknown'}
ASSIGNEE: ${task.assignee?.name || 'Unassigned'} (Skills: ${task.assignee?.skills?.join(', ') || 'Unknown'})
DESCRIPTION: ${task.description || 'No description'}

BLOCKERS:
${task.blockers.map((b, i) => `${i + 1}. ${b}`).join('\n')}

Provide a JSON response:
{
  "blockerAnalysis": [
    {
      "blocker": "original blocker text",
      "category": "technical|dependency|resource|external|unclear_requirements",
      "severity": "low|medium|high|critical",
      "suggestedAction": "specific action to resolve",
      "estimatedEffort": "quick_fix|few_hours|day|multiple_days"
    }
  ],
  "overallRecommendation": "What should be done first",
  "escalationNeeded": true/false,
  "escalationReason": "reason if escalation needed"
}`

    const result = await model.generateContent(prompt)
    const response = result.response.text()
    
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return { analysis: JSON.parse(jsonMatch[0]) }
    }
    
    return { analysis: response }
  } catch (error) {
    console.error('[GeminiAI] Error analyzing blockers:', error.message)
    return { error: error.message }
  }
}

/**
 * Generate team performance summary for managers
 */
async function generateTeamSummary(managerId) {
  if (!isAvailable()) {
    return { error: 'Gemini AI not configured' }
  }

  try {
    // Get projects managed by this user
    const projects = await Project.find({
      $or: [{ owner: managerId }, { members: managerId }],
      status: 'active'
    }).lean()

    const projectIds = projects.map(p => p._id)
    
    // Get all tasks in these projects
    const tasks = await Task.find({ project: { $in: projectIds } })
      .populate('assignee', 'name')
      .lean()

    // Get team members
    const memberIds = [...new Set(tasks.map(t => t.assignee?._id?.toString()).filter(Boolean))]
    
    // Calculate stats per member
    const memberStats = {}
    for (const task of tasks) {
      if (!task.assignee) continue
      const memberId = task.assignee._id.toString()
      if (!memberStats[memberId]) {
        memberStats[memberId] = {
          name: task.assignee.name,
          total: 0,
          completed: 0,
          blocked: 0,
          overdue: 0
        }
      }
      memberStats[memberId].total++
      if (task.status === 'done') memberStats[memberId].completed++
      if (task.status === 'blocked') memberStats[memberId].blocked++
      if (task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done') {
        memberStats[memberId].overdue++
      }
    }

    const prompt = `You are a project management AI. Analyze this team's performance and provide insights for the manager.

PROJECTS: ${projects.map(p => p.name).join(', ')}

TEAM PERFORMANCE:
${Object.values(memberStats).map(m => 
  `- ${m.name}: ${m.total} tasks (${m.completed} done, ${m.blocked} blocked, ${m.overdue} overdue)`
).join('\n')}

OVERALL:
- Total Tasks: ${tasks.length}
- Completed: ${tasks.filter(t => t.status === 'done').length}
- In Progress: ${tasks.filter(t => t.status === 'in_progress').length}
- Blocked: ${tasks.filter(t => t.status === 'blocked').length}

Provide a JSON response:
{
  "teamHealthScore": 0-100,
  "summary": "2-3 sentence overview",
  "topPerformers": ["name1", "name2"],
  "needsAttention": ["name1 - reason", "name2 - reason"],
  "actionItems": ["specific action 1", "specific action 2", "specific action 3"],
  "riskAreas": ["risk 1", "risk 2"],
  "positiveHighlights": ["highlight 1", "highlight 2"]
}`

    const result = await model.generateContent(prompt)
    const response = result.response.text()
    
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return { summary: JSON.parse(jsonMatch[0]), memberStats }
    }
    
    return { summary: response, memberStats }
  } catch (error) {
    console.error('[GeminiAI] Error generating team summary:', error.message)
    return { error: error.message }
  }
}

/**
 * Generate sprint retrospective insights
 */
async function generateSprintRetrospective(projectId, startDate, endDate) {
  if (!isAvailable()) {
    return { error: 'Gemini AI not configured' }
  }

  try {
    const project = await Project.findById(projectId).lean()
    if (!project) return { error: 'Project not found' }

    // Get tasks completed in this period
    const tasks = await Task.find({
      project: projectId,
      updatedAt: { $gte: startDate, $lte: endDate }
    }).populate('assignee', 'name').lean()

    // Get daily updates in this period
    const updates = await DailyUpdate.find({
      task: { $in: tasks.map(t => t._id) },
      createdAt: { $gte: startDate, $lte: endDate }
    }).lean()

    const completed = tasks.filter(t => t.status === 'done')
    const blocked = tasks.filter(t => t.status === 'blocked')
    const allBlockers = tasks.flatMap(t => t.blockers || [])

    const prompt = `Generate a sprint retrospective analysis for this project:

PROJECT: ${project.name}
SPRINT PERIOD: ${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}

METRICS:
- Tasks Completed: ${completed.length}
- Tasks Still In Progress: ${tasks.filter(t => t.status === 'in_progress').length}
- Tasks Blocked: ${blocked.length}
- Total Daily Updates: ${updates.length}

COMPLETED TASKS:
${completed.map(t => `- "${t.title}" by ${t.assignee?.name || 'Unknown'}`).join('\n') || 'None'}

BLOCKERS ENCOUNTERED:
${allBlockers.length ? allBlockers.join('\n') : 'None reported'}

Provide a JSON retrospective:
{
  "sprintScore": 0-100,
  "velocitySummary": "Assessment of team velocity",
  "whatWentWell": ["item1", "item2", "item3"],
  "whatCouldImprove": ["item1", "item2", "item3"],
  "blockerPatterns": "Analysis of common blockers",
  "recommendationsForNextSprint": ["rec1", "rec2", "rec3"],
  "teamMorale": "Assessment based on update frequency and blockers",
  "keyLearnings": ["learning1", "learning2"]
}`

    const result = await model.generateContent(prompt)
    const response = result.response.text()
    
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return { retrospective: JSON.parse(jsonMatch[0]) }
    }
    
    return { retrospective: response }
  } catch (error) {
    console.error('[GeminiAI] Error generating retrospective:', error.message)
    return { error: error.message }
  }
}

/**
 * Smart task estimation based on historical data
 */
async function estimateTaskDuration(taskDetails, userId) {
  if (!isAvailable()) {
    return { error: 'Gemini AI not configured' }
  }

  try {
    // Get user's historical task completion data
    const completedTasks = await Task.find({
      assignee: userId,
      status: 'done'
    }).select('title description priority startDate updatedAt').lean()

    // Calculate average completion times by priority
    const completionTimes = completedTasks
      .filter(t => t.startDate)
      .map(t => ({
        priority: t.priority,
        days: Math.ceil((new Date(t.updatedAt) - new Date(t.startDate)) / (1000 * 60 * 60 * 24))
      }))

    const prompt = `Estimate how long this task will take based on the developer's history:

NEW TASK:
- Title: ${taskDetails.title}
- Description: ${taskDetails.description || 'Not provided'}
- Priority: ${taskDetails.priority || 'medium'}

DEVELOPER'S HISTORY (${completedTasks.length} completed tasks):
${completionTimes.slice(0, 10).map(t => `- ${t.priority} priority: ${t.days} days`).join('\n') || 'No historical data'}

Provide a JSON estimate:
{
  "estimatedDays": number,
  "confidenceLevel": "low|medium|high",
  "reasoning": "Brief explanation",
  "suggestedDeadline": "YYYY-MM-DD",
  "riskFactors": ["factor1", "factor2"],
  "tips": ["tip for completing faster"]
}`

    const result = await model.generateContent(prompt)
    const response = result.response.text()
    
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return { estimate: JSON.parse(jsonMatch[0]) }
    }
    
    return { estimate: response }
  } catch (error) {
    console.error('[GeminiAI] Error estimating task:', error.message)
    return { error: error.message }
  }
}

/**
 * Generate natural language summary from daily update
 */
async function enhanceDailyUpdate(updateText, taskContext) {
  if (!isAvailable()) {
    return { enhanced: updateText }
  }

  try {
    const prompt = `Enhance this daily standup update to be more informative and professional:

TASK: "${taskContext.title}"
ORIGINAL UPDATE: "${updateText}"

Provide a JSON response:
{
  "enhanced": "Improved version of the update (keep it concise)",
  "keyPoints": ["point1", "point2"],
  "suggestedNextSteps": ["step1", "step2"]
}`

    const result = await model.generateContent(prompt)
    const response = result.response.text()
    
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    
    return { enhanced: updateText }
  } catch (error) {
    console.error('[GeminiAI] Error enhancing update:', error.message)
    return { enhanced: updateText }
  }
}

// Initialize on module load
initializeGemini()

module.exports = {
  initializeGemini,
  isAvailable,
  generateDailyInsights,
  analyzeBlockers,
  generateTeamSummary,
  generateSprintRetrospective,
  estimateTaskDuration,
  enhanceDailyUpdate
}
