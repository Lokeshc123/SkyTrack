const express = require('express')
const { createDailyUpdate, getTaskUpdates, getTaskJourney } = require('../controller/dailyupdates');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();



router.post('/new-update' , requireAuth , createDailyUpdate);
router.get('/task/:taskId', requireAuth, getTaskUpdates);
router.get('/task/:taskId/journey', requireAuth, getTaskJourney);


module.exports = router;