const express = require('express');
const { registerNewUser, loginUser, getUsersBasedOnRole } = require('../controller/auth');

const router = express.Router();


router.post('/register' , registerNewUser);
router.post('/login' , loginUser);
router.get('/' , getUsersBasedOnRole);  


module.exports = router;