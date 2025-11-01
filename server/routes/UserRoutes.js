const express = require('express');
const { registerNewUser, loginUser } = require('../controller/auth');

const router = express.Router();


router.post('/register' , registerNewUser);
router.post('/login' , loginUser);


module.exports = router;