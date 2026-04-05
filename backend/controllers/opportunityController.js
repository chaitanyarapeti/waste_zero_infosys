const Opportunity = require('../models/opportunity');
const User = require('../models/user');
const Notification = require('../models/Notifications');

// ✅ Create Opportunity
exports.createOpportunity = async (req, res) => {
  try {
    const {
      title,
      description,
      date,
      duration,
      required_skills,
      ngo_id,
      longitude,
      latitude,
      address,
    } = req.body;

    // Create opportunity with GeoJSON location
    const opportunity = new Opportunity({
      ngo_id,
      title,
      description,
      date,
      duration,
      required_skills,
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
        address,
      },
    });

    await opportunity.save();
    console.log('✅ Opportunity created:', opportunity.title);

    // Notify all users about the new opportunity
    const users = await User.find({});
    console.log(`📢 Notifying ${users.length} users about new opportunity`);

    // Create notifications for all users
    const notificationPromises = users.map(async (user) => {
      const notification = new Notification({
        user_id: user._id,
        type: 'opportunities',
        message: `New opportunity posted: ${opportunity.title}`,
        sent_at: new Date(),
      });
      return notification.save();
    });

    await Promise.all(notificationPromises);
    console.log(`✅ Successfully created ${users.length} notifications`);

    res.status(201).json(opportunity);
  } catch (err) {
    console.error('❌ Error creating opportunity:', err);
    res.status(400).json({ error: err.message });
  }
};

// ✅ Get All Opportunities
exports.getOpportunities = async (req, res) => {
  try {
    const opportunities = await Opportunity.find().populate('ngo_id', 'name email');
    res.json(opportunities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get Single Opportunity
exports.getOpportunityById = async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id).populate('ngo_id', 'name email');
    if (!opportunity) return res.status(404).json({ error: 'Opportunity not found' });
    res.json(opportunity);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Update Opportunity
exports.updateOpportunity = async (req, res) => {
  try {
    const opportunity = await Opportunity.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!opportunity) return res.status(404).json({ error: 'Opportunity not found' });
    res.json(opportunity);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ✅ Delete Opportunity
exports.deleteOpportunity = async (req, res) => {
  try {
    const opportunity = await Opportunity.findByIdAndDelete(req.params.id);
    if (!opportunity) return res.status(404).json({ error: 'Opportunity not found' });
    res.json({ message: 'Opportunity deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get Nearby Opportunities (within 50 km)
exports.getNearbyOpportunities = async (req, res) => {
  try {
    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    const nearby = await Opportunity.find({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(longitude), parseFloat(latitude)] },
          $maxDistance: 50000, // 50 km in meters
        },
      },
    });

    res.json(nearby);
  } catch (error) {
    console.error('❌ Error fetching nearby opportunities:', error);
    res.status(500).json({ message: error.message });
  }
};
