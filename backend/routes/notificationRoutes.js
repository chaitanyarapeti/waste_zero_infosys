const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// Create a new notification
router.post('/', notificationController.createNotification);

// Get all notifications for a user
router.get('/user/:userId', notificationController.getUserNotifications);

// Get notification by ID
router.get('/:id', notificationController.getNotificationById);

// Update notification
router.put('/:id', notificationController.updateNotification);

// Delete notification
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;