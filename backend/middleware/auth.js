const config = require('../config/config');

/**
 * Mock authentication middleware
 * In a real application, this would validate JWT tokens or session cookies
 */
const authenticateUser = (req, res, next) => {
  try {
    // For this assignment, we'll use a mock user
    // In real-world, you would:
    // 1. Extract token from Authorization header
    // 2. Verify JWT token
    // 3. Fetch user details from database
    
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Please provide Authorization header'
      });
    }

    // Mock token validation (in real app, verify JWT)
    if (authHeader !== 'Bearer mock-token') {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Please provide valid authentication token'
      });
    }

    // Attach mock user to request
    req.user = config.mockUser;
    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Authentication failed',
      message: error.message
    });
  }
};

/**
 * Optional middleware that adds user if token is present
 * Useful for endpoints that can work with or without authentication
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader === 'Bearer mock-token') {
    req.user = config.mockUser;
  }
  
  next();
};

module.exports = {
  authenticateUser,
  optionalAuth
};
