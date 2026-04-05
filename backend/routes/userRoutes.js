const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
} = require('../controllers/usercontroller');

// Create/Register
router.post('/register', registerUser);

// Login
router.post('/login', loginUser);

// Read all
router.get('/', getAllUsers);

// Read by ID
router.get('/:id', getUserById);

// Update
router.put('/:id', updateUser);

// Delete
router.delete('/:id', deleteUser);

module.exports = router;