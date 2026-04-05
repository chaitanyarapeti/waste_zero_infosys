const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    // Reference to the user who sent the message
    sender_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    // Reference to the user who received the message
    receiver_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    // The content of the message
    content: {
      type: String,
      required: true
    },

    // The time the message was sent
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true } // Adds createdAt and updatedAt automatically
);

module.exports = mongoose.model('Message', messageSchema);
