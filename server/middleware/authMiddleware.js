const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');

// Protect routes
const protect = asyncHandler(async (req, res, next) => {
  // For development purposes, always allow requests without a token
  // Mock a user for development
  req.user = { id: 'dev-user-id', name: 'Development User' };
  return next();
});

module.exports = { protect }; 