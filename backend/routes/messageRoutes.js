const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

// Create a new message
router.post('/', messageController.createMessage);

// Get all messages for a user
router.get('/user/:userId', messageController.getUserMessages);

// Get conversation between two users
router.get('/conversation/:user1Id/:user2Id', messageController.getConversation);

// Update a message
router.put('/:id', messageController.updateMessage);

// Delete a message
router.delete('/:id', messageController.deleteMessage);

module.exports = router;