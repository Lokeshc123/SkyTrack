const { z } = require('zod')
const User = require('../models/User')
const { signToken } = require('../utils/jwt')


const registerNewUser = async (req, res) => {
    try {

      
           const body = z.object({
            name: z.string().min(2),
            email: z.string().email(),
            password: z.string().min(6),
            role: z.enum(['admin', 'manager', 'dev']).optional(),
            skills: z.array(z.string()).optional(),
            workloadHours: z.number().min(0).optional()
            }).parse(req.body);


            const exists = await User.findOne({ email: body.email })
            if (exists) return res.status(409).json({ error: 'Email already in use' })


            const passwordHash = await User.hashPassword(body.password)
            const user = await User.create({
            name: body.name,
            email: body.email,
            role: body.role || 'dev',
            passwordHash
            })
            const token = signToken(user)
            res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } })
        }
    catch (error) {
        return res.status(500).json({ error: 'Server error' , details: error.message })
    }
}



const loginUser = async (req, res) => {
    try {
        const body = z.object({ email: z.string().email(), password: z.string().min(1) }).parse(req.body)
        const user = await User.findOne({ email: body.email })
        if (!user) return res.status(401).json({ error: 'Invalid credentials' })
        const ok = await user.verifyPassword(body.password)
        if (!ok) return res.status(401).json({ error: 'Invalid credentials' })
        const token = signToken(user)
        res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } })
} catch (err) {
        res.status(400).json({ error: err.message })
    }
}

const getUsersBasedOnRole = async (req, res) => {
  try {
    const { role } = req.query; // ← query parameter
    const filter = {};

    if (role) filter.role = role; // optional filter if provided

    const users = await User.find(filter).select('name email role');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
}

module.exports = {
    registerNewUser,
    loginUser,
    getUsersBasedOnRole
}