const express = require('express');
const {
  registerUser,
  loginUser,
  getMe,
  logout
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.get('/logout', protect, logout);

module.exports = router; 