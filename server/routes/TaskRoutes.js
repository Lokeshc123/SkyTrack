const express  = require('express')
const { createTask , getTasks , getMyTasks, getTaskById, updateTask } = require('../controller/task');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();




router.post('/new-task' , requireAuth , createTask);
router.get('/' , requireAuth , getTasks);
router.get('/my-tasks' , requireAuth , getMyTasks);
router.get('/:id' , requireAuth , getTaskById);
router.patch('/:id' , requireAuth , updateTask);


module.exports = router;
