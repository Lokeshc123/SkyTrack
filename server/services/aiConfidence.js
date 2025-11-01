function scoreConfidence (taskDoc) {
const now = Date.now()
const due = taskDoc.dueDate ? new Date(taskDoc.dueDate).getTime() : null
const daysLeft = due ? Math.max(0, (due - now) / (1000 * 60 * 60 * 24)) : 14


// Simple heuristic baseline
let score = 80
score -= (taskDoc.blockers?.length || 0) * 10
score += (taskDoc.progress || 0) * 0.2
score += Math.min(20, daysLeft)


// Clamp 0–100
return Math.max(0, Math.min(100, Math.round(score)))
}

module.exports = { scoreConfidence };