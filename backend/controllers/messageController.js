const Message = require('../models/Messages');
const User = require('../models/user');
const Notification = require('../models/Notifications');

// Create a new message
exports.createMessage = async (req, res) => {
  try {
    const message = new Message({
      sender_id: req.body.sender_id,
      receiver_id: req.body.receiver_id,
      content: req.body.content
    });
    const savedMessage = await message.save();
    
    // Get sender information
    const sender = await User.findById(req.body.sender_id);
    
    // Create notification for the receiver
    const notification = new Notification({
      user_id: req.body.receiver_id,
      type: 'messages',
      message: `New message from ${sender?.name || 'Someone'}: ${req.body.content.substring(0, 50)}${req.body.content.length > 50 ? '...' : ''}`,
      sent_at: new Date()
    });
    
    await notification.save();
    console.log(`Message notification sent to user ${req.body.receiver_id} from ${sender?.name}`);
    
    res.status(201).json(savedMessage);
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(400).json({ message: error.message });
  }
};

// Get all messages for a user (both sent and received)
exports.getUserMessages = async (req, res) => {
  try {
    const userId = req.params.userId;
    const messages = await Message.find({
      $or: [
        { sender_id: userId },
        { receiver_id: userId }
      ]
    })
      .populate('sender_id', 'name email')
      .populate('receiver_id', 'name email')
      .sort({ timestamp: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get conversation between two users
exports.getConversation = async (req, res) => {
  try {
    const { user1Id, user2Id } = req.params;
    const messages = await Message.find({
      $or: [
        { sender_id: user1Id, receiver_id: user2Id },
        { sender_id: user2Id, receiver_id: user1Id }
      ]
    })
      .sort({ timestamp: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a message
exports.updateMessage = async (req, res) => {
  try {
    const updatedMessage = await Message.findByIdAndUpdate(
      req.params.id,
      {
        content: req.body.content
      },
      { new: true }
    );
    if (!updatedMessage) {
      return res.status(404).json({ message: 'Message not found' });
    }
    res.json(updatedMessage);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a message
exports.deleteMessage = async (req, res) => {
  try {
    const deletedMessage = await Message.findByIdAndDelete(req.params.id);
    if (!deletedMessage) {
      return res.status(404).json({ message: 'Message not found' });
    }
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};