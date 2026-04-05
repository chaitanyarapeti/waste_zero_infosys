const express = require('express');
const router = express.Router();
const opportunityController = require('../controllers/opportunityController');

// ✅ Create a new opportunity
router.post('/', opportunityController.createOpportunity);

// ✅ Get all opportunities
router.get('/', opportunityController.getOpportunities);

// ✅ Get a single opportunity by ID
router.get('/:id', opportunityController.getOpportunityById);

// ✅ Update an opportunity by ID
router.put('/:id', opportunityController.updateOpportunity);

// ✅ Delete an opportunity by ID
router.delete('/:id', opportunityController.deleteOpportunity);

// ✅ Get nearby opportunities (within 50 km)
router.get('/nearby/location', opportunityController.getNearbyOpportunities);

module.exports = router;
