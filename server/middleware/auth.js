const jwt = require('jsonwebtoken')
const User = require('../models/User')


function requireAuth (req, res, next) {
try {

const header = req.headers.authorization || ''
const token = header.startsWith('Bearer ') ? header.slice(7) : null
if (!token) return res.status(401).json({ error: 'Missing token' })
const payload = jwt.verify(token, process.env.JWT_SECRET)
req.user = payload
next()
} catch (e) {
return res.status(401).json({ error: 'Invalid token' , msg : e.message })
}
}


function requireRole (...roles) {
  return async (req, res, next) => {
    try {
      if (!req.user) return res.status(401).json({ error: 'Unauthenticated' })
      const user = await User.findById(req.user.id).lean()
      if (!user || !roles.includes(user.role)) {
        return res.status(403).json({ error: 'Forbidden' , message : `Requires role: ${roles.join(' or ')} and your role is: ${user.role}` })
      }
      next()
    } catch (err) {
      next(err)
    }
  }
}


module.exports = { requireAuth, requireRole }