const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const NotificationPreferencesSchema = new mongoose.Schema({
  email: { type: Boolean, default: true },
  push: { type: Boolean, default: true },
  eodReminder: { type: Boolean, default: true },
  deadlineAlerts: { type: Boolean, default: true },
  taskAssignments: { type: Boolean, default: true },
  aiRecommendations: { type: Boolean, default: true },
  quietHoursStart: { type: String, default: '22:00' }, // HH:mm format
  quietHoursEnd: { type: String, default: '08:00' }
}, { _id: false })

const UserSchema = new mongoose.Schema({
name: { type: String, required: true, trim: true },
email: { type: String, required: true, unique: true, lowercase: true, index: true },
role: { type: String, enum: ['admin', 'manager', 'dev'], default: 'dev', index: true },
skills: [{ type: String }],
passwordHash: { type: String, required: true },
workloadHours: { type: Number, default: 40 }, // weekly planned hours
isActive: { type: Boolean, default: true },
notificationPreferences: { type: NotificationPreferencesSchema, default: () => ({}) },
lastActiveAt: { type: Date, default: Date.now },
avatar: { type: String }, // URL to avatar image
timezone: { type: String, default: 'UTC' }
}, { timestamps: true })


UserSchema.methods.verifyPassword = async function (password) {
return bcrypt.compare(password, this.passwordHash)
}


UserSchema.statics.hashPassword = async function (password) {
const salt = await bcrypt.genSalt(10)
return bcrypt.hash(password, salt)
}

// Check if user should receive notification based on preferences
UserSchema.methods.shouldReceiveNotification = function (type) {
  const prefs = this.notificationPreferences || {}
  
  const typeMapping = {
    'task_assigned': prefs.taskAssignments !== false,
    'eod_reminder': prefs.eodReminder !== false,
    'deadline_soon': prefs.deadlineAlerts !== false,
    'ai_recommendation': prefs.aiRecommendations !== false,
    'generic': true
  }
  
  return typeMapping[type] ?? true
}

// Check if currently in quiet hours
UserSchema.methods.isQuietHours = function () {
  const prefs = this.notificationPreferences || {}
  if (!prefs.quietHoursStart || !prefs.quietHoursEnd) return false
  
  const now = new Date()
  const currentTime = now.getHours() * 60 + now.getMinutes()
  
  const [startH, startM] = prefs.quietHoursStart.split(':').map(Number)
  const [endH, endM] = prefs.quietHoursEnd.split(':').map(Number)
  
  const startMinutes = startH * 60 + startM
  const endMinutes = endH * 60 + endM
  
  // Handle overnight quiet hours (e.g., 22:00 to 08:00)
  if (startMinutes > endMinutes) {
    return currentTime >= startMinutes || currentTime < endMinutes
  }
  
  return currentTime >= startMinutes && currentTime < endMinutes
}


module.exports = mongoose.model('User', UserSchema)