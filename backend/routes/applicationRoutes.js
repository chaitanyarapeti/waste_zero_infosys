const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');

// Create a new application
router.post('/', applicationController.createApplication);

// Get all applications
router.get('/', applicationController.getAllApplications);

// Get application by ID
router.get('/:id', applicationController.getApplicationById);

// Update application
router.put('/:id', applicationController.updateApplication);

// Delete application
router.delete('/:id', applicationController.deleteApplication);

module.exports = router;