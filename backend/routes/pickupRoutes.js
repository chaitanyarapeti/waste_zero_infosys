const express = require('express');
const router = express.Router();
const pickupController = require('../controllers/pickupController');

// Create a new pickup
router.post('/', pickupController.createPickup);

// Get all pickups
router.get('/', pickupController.getAllPickups);

// Get pickups by user ID (MUST come before /:id route)
router.get('/user/:userId', pickupController.getUserPickups);

// Get pickup by ID
router.get('/:id', pickupController.getPickupById);

// Update pickup
router.put('/:id', pickupController.updatePickup);

// Delete pickup
router.delete('/:id', pickupController.deletePickup);

module.exports = router;