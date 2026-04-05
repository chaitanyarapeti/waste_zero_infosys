const User = require('../models/user');
const bcrypt = require('bcryptjs');

// Register User
const registerUser = async (req, res) => {
  try {
    console.log('📝 Registration attempt:', { email: req.body.email, role: req.body.role });
    
    const { name, email, password, role, skills, location, bio } = req.body;

    // Validate required fields
    if (!name || !email || !password || !role) {
      console.log('❌ Missing required fields');
      return res.status(400).json({ message: "Name, email, password, and role are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('❌ User already exists:', email);
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      skills,
      location,
      bio
    });

    await user.save();
    console.log('✅ User registered successfully:', user.email);
    
    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.status(201).json({ message: "User registered successfully!", user: userResponse });
  } catch (error) {
    console.error("❌ Registration error:", error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
}

//  Login User
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const userData = user.toObject();
    delete userData.password;

    res.json({ message: "Login successful", user: userData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  Get All Users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  Get User by ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update User
const updateUser = async (req, res) => {
  try {
    if (req.body.password) {
      const user = await User.findById(req.params.id);
      if (!user) throw new Error("User not found");

      const isSame = await bcrypt.compare(req.body.password, user.password);
      if (isSame) {
        throw new Error("New password must be different from the old password");
      }

      req.body.password = await bcrypt.hash(req.body.password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedUser) throw new Error("User not found");

    const userData = updatedUser.toObject();
    delete userData.password;

    res.json(userData);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

//  Delete User
const deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};