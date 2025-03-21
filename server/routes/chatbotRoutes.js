const express = require('express');
const {
  getConversation,
  getConversations,
  startConversation,
  sendMessage,
  clearConversation,
  clearAllConversations
} = require('../controllers/chatbotController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Conversations routes
router.route('/conversations')
  .get(protect, getConversations)
  .post(protect, startConversation)
  .delete(protect, clearAllConversations);

// Single conversation routes
router.route('/conversations/:conversationId')
  .get(protect, getConversation)
  .delete(protect, clearConversation);

// Message routes
router.route('/conversations/:conversationId/messages')
  .post(protect, sendMessage);

module.exports = router; 