const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
  getAdminStats,
  getAllUsers,
  suspendUser,
  activateUser,
  deleteUser,
  deletePickup,
  deleteOpportunity,
  getAdminLogs,
  generateReport
} = require('../controllers/adminController');

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin only.' });
  }
};

// Get admin statistics
router.get('/stats', authMiddleware, isAdmin, getAdminStats);

// Get all users
router.get('/users', authMiddleware, isAdmin, getAllUsers);

// Suspend user
router.put('/users/:userId/suspend', authMiddleware, isAdmin, suspendUser);

// Activate user
router.put('/users/:userId/activate', authMiddleware, isAdmin, activateUser);

// Delete user
router.delete('/users/:userId', authMiddleware, isAdmin, deleteUser);

// Delete pickup (admin control)
router.delete('/pickups/:pickupId', authMiddleware, isAdmin, deletePickup);

// Delete opportunity (admin control)
router.delete('/opportunities/:opportunityId', authMiddleware, isAdmin, deleteOpportunity);

// Get admin logs
router.get('/logs', authMiddleware, isAdmin, getAdminLogs);

// Generate reports
router.get('/reports/:reportType', authMiddleware, isAdmin, generateReport);

module.exports = router;
