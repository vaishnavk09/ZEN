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

// Start a new conversation
router.route('/conversation')
  .post(protect, startConversation);

// Send message to chatbot
router.route('/message')
  .post(protect, sendMessage);

// Get conversation history
router.route('/conversation/:conversationId')
  .get(protect, getConversation);

// Clear conversation
router.route('/conversation/:conversationId/clear')
  .post(protect, clearConversation);

// Get all conversations
router.route('/conversations')
  .get(protect, getConversations)
  .delete(protect, clearAllConversations);

module.exports = router; 