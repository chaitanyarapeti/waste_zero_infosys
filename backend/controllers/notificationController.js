const Notification = require('../models/Notifications');
const mongoose = require('mongoose');

// Create a new notification
exports.createNotification = async (req, res) => {
  try {
    const notification = new Notification({
      user_id: req.body.user_id,
      type: req.body.type,
      message: req.body.message
    });
    const savedNotification = await notification.save();
    res.status(201).json(savedNotification);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all notifications for a user
exports.getUserNotifications = async (req, res) => {
  try {
    console.log('Fetching notifications for userId:', req.params.userId);
    
    // Try to match both ObjectId and string/number formats
    const userId = req.params.userId;
    let query;
    
    // Check if it's a valid ObjectId format
    if (mongoose.Types.ObjectId.isValid(userId)) {
      query = {
        $or: [
          { user_id: userId },
          { user_id: new mongoose.Types.ObjectId(userId) }
        ]
      };
    } else {
      query = {
        $or: [
          { user_id: userId },
          { user_id: parseInt(userId) }
        ]
      };
    }
    
    const notifications = await Notification.find(query).sort({ sent_at: -1 });
    console.log(`Found ${notifications.length} notifications`);
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get notification by ID
exports.getNotificationById = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update notification
exports.updateNotification = async (req, res) => {
  try {
    console.log('Updating notification with ID:', req.params.id);
    console.log('Update data:', req.body);
    
    const updateData = {};
    
    if (req.body.type !== undefined) updateData.type = req.body.type;
    if (req.body.message !== undefined) updateData.message = req.body.message;
    if (req.body.is_read !== undefined) updateData.is_read = req.body.is_read;
    
    const updatedNotification = await Notification.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    if (!updatedNotification) {
      console.log('Notification not found with ID:', req.params.id);
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    console.log('Notification updated successfully:', updatedNotification);
    res.json(updatedNotification);
  } catch (error) {
    console.error('Error updating notification:', error);
    res.status(400).json({ message: error.message });
  }
};

// Delete notification
exports.deleteNotification = async (req, res) => {
  try {
    console.log('Deleting notification with ID:', req.params.id);
    
    const deletedNotification = await Notification.findByIdAndDelete(req.params.id);
    
    if (!deletedNotification) {
      console.log('Notification not found with ID:', req.params.id);
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    console.log('Notification deleted successfully');
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: error.message });
  }
};