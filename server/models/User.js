const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const UserSchema = new mongoose.Schema({
name: { type: String, required: true, trim: true },
email: { type: String, required: true, unique: true, lowercase: true, index: true },
role: { type: String, enum: ['admin', 'manager', 'dev'], default: 'dev', index: true },
skills: [{ type: String }],
passwordHash: { type: String, required: true },
workloadHours: { type: Number, default: 0 }, // weekly planned hours
isActive: { type: Boolean, default: true }
}, { timestamps: true })


UserSchema.methods.verifyPassword = async function (password) {
return bcrypt.compare(password, this.passwordHash)
}


UserSchema.statics.hashPassword = async function (password) {
const salt = await bcrypt.genSalt(10)
return bcrypt.hash(password, salt)
}


module.exports = mongoose.model('User', UserSchema)