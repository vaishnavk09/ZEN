const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  try {
    // Skip MongoDB check in development mode
    if (process.env.SKIP_MONGO === 'true') {
      // For development without MongoDB, we'll use a mock user
      if (token === 'mock-jwt-token-for-development') {
        req.user = {
          id: '60d21b4667d0d8992e610c85',
          _id: '60d21b4667d0d8992e610c85',
          name: 'Test User',
          email: 'test@example.com'
        };
        return next();
      }
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id);

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
}; 