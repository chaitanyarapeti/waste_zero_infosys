const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema(
  {
    // Reference to the NGO (User)
    ngo_id: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },

    // Basic details
    title: { 
      type: String, 
      required: true 
    },

    description: { 
      type: String, 
      required: true 
    },

    // Date of opportunity
    date: { 
      type: String, 
      required: true 
    },

    // Required skills
    required_skills: { 
      type: [String], 
      default: [] 
    },

    // Duration of the opportunity
    duration: { 
      type: String, 
      required: true 
    },

    // GeoJSON location for map + coordinates
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
      address: {
        type: String, // Optional: to store readable address
      },
    },

    // Status of the opportunity
    status: { 
      type: String, 
      enum: ["Open", "Closed", "In Progress"], 
      default: "Open" 
    },
  },
  { 
    timestamps: true 
  }
);

// Create a 2dsphere index for geospatial queries
opportunitySchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Opportunity', opportunitySchema);
