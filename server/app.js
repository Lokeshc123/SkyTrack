const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/UserRoutes');
const projectRoutes = require('./routes/ProjectRoutes');
const taskRoutes = require('./routes/TaskRoutes');
const dailyupdatesRoutes = require('./routes/DailyUpdateRoutes');
const notificationRoutes = require('./routes/NotificationRoutes');
const aiRoutes = require('./routes/AIRoutes');


const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/daily-updates', dailyupdatesRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai', aiRoutes);




module.exports = app;