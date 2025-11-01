const mongoose = require('mongoose')


const ProjectSchema = new mongoose.Schema({
name: { type: String, required: true, trim: true },
key: { type: String, required: true, uppercase: true, unique: true }, // like JIRA key
description: { type: String },
owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
status: { type: String, enum: ['active', 'paused', 'completed'], default: 'active' }
}, { timestamps: true })


module.exports = mongoose.model('Project', ProjectSchema)