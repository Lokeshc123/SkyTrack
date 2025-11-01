const mongoose = require('mongoose')


const DailyUpdateSchema = new mongoose.Schema({
task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', index: true, required: true },
author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
date: { type: Date, required: true, default: () => new Date().setHours(0, 0, 0, 0), index: true },
note: { type: String },
progress: { type: Number, min: 0, max: 100 },
blockers: [{ type: String }],
confidenceOverride: { type: Number, min: 0, max: 100 }
}, { timestamps: true })


module.exports = mongoose.model('DailyUpdate', DailyUpdateSchema)