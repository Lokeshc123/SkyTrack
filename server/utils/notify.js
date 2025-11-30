const Notification = require('../models/Notification')

async function notifyUser(io, { userId, type, title, message, actionUrl, meta }) {
  const doc = await Notification.create({
    user: userId, type, title, message, actionUrl, meta
  })

  io.to(`user:${userId}`).emit('notification:new', {
    _id: doc._id,
    type: doc.type,
    title: doc.title,
    message: doc.message,
    actionUrl: doc.actionUrl,
    createdAt: doc.createdAt,
  })
  return doc
}

module.exports = { notifyUser }
