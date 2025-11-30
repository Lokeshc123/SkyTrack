const express = require('express');
const { 
  registerNewUser, 
  loginUser, 
  getUsersBasedOnRole,
  getUserProfile,
  updateUserProfile,
  changePassword,
  getUserStats,
  deactivateUser,
  reactivateUser,
  getUserById,
  updateUserRole,
  adminCreateUser,
  adminUpdateUser,
  adminDeleteUser
} = require('../controller/auth');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/register', registerNewUser);
router.post('/login', loginUser);

// Protected routes
router.get('/', requireAuth, getUsersBasedOnRole);  
router.get('/profile', requireAuth, getUserProfile);
router.patch('/profile', requireAuth, updateUserProfile);
router.post('/change-password', requireAuth, changePassword);
router.get('/stats', requireAuth, getUserStats);
router.get('/stats/:id', requireAuth, getUserStats);

// Admin routes
router.post('/', requireAuth, adminCreateUser);
router.put('/:id', requireAuth, adminUpdateUser);
router.delete('/:id', requireAuth, adminDeleteUser);

router.get('/:id', requireAuth, getUserById);
router.patch('/:id/role', requireAuth, updateUserRole);
router.patch('/:id/deactivate', requireAuth, deactivateUser);
router.patch('/:id/reactivate', requireAuth, reactivateUser);


module.exports = router;