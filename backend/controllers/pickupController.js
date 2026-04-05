const Pickup = require('../models/Pickups');

// Create a new pickup
exports.createPickup = async (req, res) => {
  try {
    const { address, city, pickupDate, timeSlot, wasteTypes, additionalNotes, user_id } = req.body;

    // Validate required fields
    if (!user_id) {
      return res.status(400).json({ 
        message: 'User ID is required' 
      });
    }

    if (!address || !city || !pickupDate || !timeSlot) {
      return res.status(400).json({ 
        message: 'Please provide all required fields: address, city, pickupDate, and timeSlot' 
      });
    }

    if (!wasteTypes || wasteTypes.length === 0) {
      return res.status(400).json({ 
        message: 'Please select at least one waste type' 
      });
    }

    // Create scheduled_time based on pickup date and time slot
    const pickupDateObj = new Date(pickupDate);
    let scheduledTime = new Date(pickupDateObj);

    // Set time based on time slot
    if (timeSlot === 'morning') {
      scheduledTime.setHours(10, 0, 0, 0); // 10:00 AM
    } else if (timeSlot === 'afternoon') {
      scheduledTime.setHours(14, 0, 0, 0); // 2:00 PM
    } else if (timeSlot === 'evening') {
      scheduledTime.setHours(18, 0, 0, 0); // 6:00 PM
    }

    const pickup = new Pickup({
      user_id: user_id,
      address,
      city,
      pickup_date: pickupDateObj,
      time_slot: timeSlot,
      scheduled_time: scheduledTime,
      waste_types: wasteTypes,
      additional_notes: additionalNotes || '',
      category: wasteTypes.join(', '), // For backward compatibility
      status: 'Scheduled'
    });

    const savedPickup = await pickup.save();
    
    res.status(201).json({ 
      message: 'Pickup scheduled successfully!',
      pickup: savedPickup 
    });
  } catch (error) {
    console.error('Error creating pickup:', error.message);
    res.status(400).json({ 
      message: error.message,
      details: error.errors ? Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      })) : null
    });
  }
};

// Get all pickups
exports.getAllPickups = async (req, res) => {
  try {
    const pickups = await Pickup.find()
      .populate('user_id', 'name email')
      .sort({ scheduled_time: -1 });
    res.json(pickups);
  } catch (error) {
    console.error('Error fetching all pickups:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get pickup by ID
exports.getPickupById = async (req, res) => {
  try {
    const pickup = await Pickup.findById(req.params.id)
      .populate('user_id', 'name email phone');
    if (!pickup) {
      return res.status(404).json({ message: 'Pickup not found' });
    }
    res.json(pickup);
  } catch (error) {
    console.error('Error fetching pickup by ID:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get pickups by user ID
exports.getUserPickups = async (req, res) => {
  try {
    const pickups = await Pickup.find({ user_id: req.params.userId })
      .sort({ scheduled_time: -1 });
    
    res.json(pickups);
  } catch (error) {
    console.error('Error fetching user pickups:', error.message);
    res.status(500).json({ 
      message: error.message,
      error: 'Failed to fetch pickup history'
    });
  }
};

// Update pickup
exports.updatePickup = async (req, res) => {
  try {
    const { address, city, pickupDate, timeSlot, wasteTypes, additionalNotes, status, agent_id } = req.body;
    
    const updateData = {};
    
    if (address) updateData.address = address;
    if (city) updateData.city = city;
    if (pickupDate) {
      updateData.pickup_date = new Date(pickupDate);
      
      // Update scheduled_time if pickup date or time slot changes
      if (timeSlot) {
        const scheduledTime = new Date(pickupDate);
        if (timeSlot === 'morning') {
          scheduledTime.setHours(10, 0, 0, 0);
        } else if (timeSlot === 'afternoon') {
          scheduledTime.setHours(14, 0, 0, 0);
        } else if (timeSlot === 'evening') {
          scheduledTime.setHours(18, 0, 0, 0);
        }
        updateData.scheduled_time = scheduledTime;
      }
    }
    if (timeSlot) updateData.time_slot = timeSlot;
    if (wasteTypes && wasteTypes.length > 0) {
      updateData.waste_types = wasteTypes;
      updateData.category = wasteTypes.join(', ');
    }
    if (additionalNotes !== undefined) updateData.additional_notes = additionalNotes;
    if (status) updateData.status = status;
    if (agent_id !== undefined) updateData.agent_id = agent_id;

    const updatedPickup = await Pickup.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('user_id', 'name email');

    if (!updatedPickup) {
      return res.status(404).json({ message: 'Pickup not found' });
    }
    res.json({ 
      message: 'Pickup updated successfully',
      pickup: updatedPickup 
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete pickup
exports.deletePickup = async (req, res) => {
  try {
    const deletedPickup = await Pickup.findByIdAndDelete(req.params.id);
    if (!deletedPickup) {
      return res.status(404).json({ message: 'Pickup not found' });
    }
    res.json({ message: 'Pickup deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};