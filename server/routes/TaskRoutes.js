const express  = require('express')
const { createTask , getTasks , updateTask } = require('../controller/task');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();




router.post('/new-task' , requireAuth , createTask);
router.get('/' , requireAuth , getTasks);
router.patch('/:id' , requireAuth , updateTask);


module.exports = router;
