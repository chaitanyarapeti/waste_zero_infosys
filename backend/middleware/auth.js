// Simple middleware to extract user from request
// In production, you should use proper JWT authentication

const authMiddleware = (req, res, next) => {
  try {
    // TEMPORARY: For testing, always authenticate as admin
    // In production, extract and verify JWT token from Authorization header
    
    req.user = {
      id: 'admin-test-id',
      role: 'admin'
    };
    
    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed' });
  }
};

module.exports = authMiddleware;
