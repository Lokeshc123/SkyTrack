const express = require('express')
const { createDailyUpdate} = require('../controller/dailyupdates');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();



router.post('/new-update' , requireAuth , createDailyUpdate);


module.exports = router;