const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    // Reference to the Opportunity being applied for
    opportunity_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Opportunity',
      required: true
    },

    // Reference to the Volunteer applying for the opportunity
    volunteer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    // Application status (Pending, Accepted, or Rejected)
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Rejected'],
      default: 'Pending'
    }
  },
  { 
    timestamps: true // Automatically adds createdAt and updatedAt
  }
);

module.exports = mongoose.model('Application', applicationSchema);
