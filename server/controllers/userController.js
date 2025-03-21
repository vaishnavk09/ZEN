const User = require('../models/User');

// Mock users for development when MongoDB is skipped
const mockUsers = process.env.SKIP_MONGO === 'true' ? [
  {
    _id: '60d21b4667d0d8992e610c85',
    name: 'Test User',
    email: 'test@example.com',
    password: '$2a$10$CwTycUXWue0Thq9StjUM0uQxTmzpSrNZ5rTf.fCjvxP7rsFlkqrZi', // password = 'password'
    getSignedJwtToken: function() {
      return 'mock-jwt-token-for-development';
    },
    matchPassword: async function(enteredPassword) {
      return enteredPassword === 'password';
    }
  }
] : [];

// @desc    Register user
// @route   POST /api/users/register
// @access  Public
exports.registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Mock registration for development when MongoDB is skipped
    if (process.env.SKIP_MONGO === 'true') {
      const existingUser = mockUsers.find(u => u.email === email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User already exists'
        });
      }

      const newUser = {
        _id: Date.now().toString(),
        name,
        email,
        password: 'hashed-password', // In a real app, would be hashed
        getSignedJwtToken: function() {
          return 'mock-jwt-token-for-development';
        },
        matchPassword: async function(enteredPassword) {
          return true; // Always return true for testing
        }
      };

      mockUsers.push(newUser);
      
      return sendTokenResponse(newUser, 201, res);
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email and password'
      });
    }

    // Mock login for development when MongoDB is skipped
    if (process.env.SKIP_MONGO === 'true') {
      const user = mockUsers.find(u => u.email === email);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      return sendTokenResponse(user, 200, res);
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/users/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    // Mock user retrieval for development when MongoDB is skipped
    if (process.env.SKIP_MONGO === 'true') {
      // For mock development, we'll just return req.user which should be set by auth middleware
      return res.status(200).json({
        success: true,
        data: req.user
      });
    }
    
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Log user out / clear cookie
// @route   GET /api/users/logout
// @access  Private
exports.logout = async (req, res, next) => {
  res.status(200).json({
    success: true,
    message: 'User logged out successfully'
  });
};

// Helper function to get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email
    }
  });
}; 