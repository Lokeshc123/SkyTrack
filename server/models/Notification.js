
const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
  type:      { type: String, enum: ['task_assigned','task_update','eod_reminder','deadline_soon','generic','ai_recommendation','project_update','blocker_alert'], default: 'generic' },
  title:     { type: String, required: true },
  message:   { type: String, required: true },
  actionUrl: { type: String },            
  meta:      { type: Object },            
  read:      { type: Boolean, default: false, index: true },
  seenAt:    { type: Date },
  priority:  { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  expiresAt: { type: Date }, // Optional expiration for time-sensitive notifications
}, { timestamps: true })                   // createdAt, updatedAt

// Index for efficient queries
notificationSchema.index({ user: 1, read: 1, createdAt: -1 })
notificationSchema.index({ user: 1, type: 1 })

module.exports = mongoose.model('Notification', notificationSchema)
