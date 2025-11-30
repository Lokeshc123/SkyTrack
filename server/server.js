const { configDotenv } = require("dotenv")
configDotenv({ quiet: true })

const http = require('http')
const app = require("./app")
const { initializeScheduler } = require('./jobs/scheduler')
const { initializeGemini } = require('./services/geminiAI')

// Re-initialize Gemini now that env vars are loaded
initializeGemini()

const connectDB = require("./config/database/db")
connectDB()

const PORT = process.env.PORT
if (!PORT) throw new Error("PORT is not defined in environment variables")


const server = http.createServer(app)


const { Server } = require('socket.io')
const io = new Server(server, { cors: { origin: '*' } })


const jwt = require('jsonwebtoken')
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token
    if (!token) return next(new Error('No token'))
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    socket.user = { id: payload.id }
    socket.join(`user:${payload.id}`)
    next()
  } catch (err) { next(new Error('Bad token')) }
})

app.set('io', io) 
initializeScheduler(app)

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
