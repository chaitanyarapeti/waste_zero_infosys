const mongoose = require('mongoose');

const pickupSchema = new mongoose.Schema(
  {
    // Reference to the user who scheduled the pickup
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Links to the User collection
      required: true
    },

    // Reference to the agent assigned to the pickup
    agent_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agent', // Links to the Agent collection
      required: false, // It might be unassigned initially
      default: null
    },

    // Address details
    address: {
      type: String,
      required: true
    },

    city: {
      type: String,
      required: true
    },

    // Pickup date
    pickup_date: {
      type: Date,
      required: true
    },

    // Preferred time slot
    time_slot: {
      type: String,
      enum: ['morning', 'afternoon', 'evening'],
      required: true
    },

    // The scheduled date and time for the pickup (datetime)
    scheduled_time: {
      type: Date,
      required: true
    },

    // Waste types (array of strings)
    waste_types: {
      type: [String],
      required: true,
      validate: {
        validator: function(v) {
          return v && v.length > 0;
        },
        message: 'At least one waste type must be selected'
      }
    },

    // Additional notes
    additional_notes: {
      type: String,
      default: ''
    },

    // The type or category of item being picked up (varchar) - for backward compatibility
    category: {
      type: String,
      required: false,
    },

    // The current status of the pickup (varchar)
    status: {
      type: String,
      enum: ['Scheduled', 'In Transit', 'Completed', 'Cancelled'], 
      default: 'Scheduled',
      required: true
    }
  },
  { 
    timestamps: true 
  }
);

module.exports = mongoose.model('Pickup', pickupSchema);