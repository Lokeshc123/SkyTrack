const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { 
  getNotificationsForUser, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  getUnreadCount,
  deleteNotification,
  deleteReadNotifications,
  getAIRecommendations,
  getTaskConfidenceAnalysis,
  createNotification
} = require('../controller/notification');
const router = express.Router();


// Get notifications with pagination and filters
router.get('/', requireAuth, getNotificationsForUser);

// Get unread notification count
router.get('/unread-count', requireAuth, getUnreadCount);

// Get AI-powered recommendations
router.get('/recommendations', requireAuth, getAIRecommendations);

// Get task confidence analysis
router.get('/task-confidence/:taskId', requireAuth, getTaskConfidenceAnalysis);

// Mark single notification as read
router.patch('/:id/read', requireAuth, markNotificationAsRead);

// Mark all notifications as read
router.post('/read-all', requireAuth, markAllNotificationsAsRead);

// Delete a notification
router.delete('/:id', requireAuth, deleteNotification);

// Delete all read notifications
router.delete('/clear-read', requireAuth, deleteReadNotifications);

// Create notification (admin/manager)
router.post('/', requireAuth, createNotification);

module.exports = router;