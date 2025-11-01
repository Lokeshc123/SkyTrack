const mongoose = require('mongoose')



const TaskSchema = new mongoose.Schema({
project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', index: true, required: true },
title: { type: String, required: true },
description: { type: String },
priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium', index: true },
status: { type: String, enum: ['todo', 'in_progress', 'blocked', 'done'], default: 'todo', index: true },
assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
startDate: { type: Date },
dueDate: { type: Date, index: true },
progress: { type: Number, default: 0, min: 0, max: 100 },
blockers: [{ type: String }],
aiConfidence: { type: Number, default: 100, min: 0, max: 100 },
dependencies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }]
}, { timestamps: true })

module.exports = mongoose.model('Task', TaskSchema)