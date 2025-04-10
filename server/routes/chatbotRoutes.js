const express = require('express');
const chatbotController = require('../controllers/chatbotController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Start a new conversation
router.route('/conversation')
  .post(protect, chatbotController.startConversation);

// Send message to chatbot
router.route('/message')
  .post(protect, chatbotController.sendMessage);

// Get conversation history
router.route('/conversation/:conversationId')
  .get(protect, chatbotController.getConversation);

// Clear conversation
router.route('/conversation/:conversationId/clear')
  .post(protect, chatbotController.clearConversation);

// Get all conversations
router.route('/conversations')
  .get(protect, chatbotController.getConversations)
  .delete(protect, chatbotController.clearAllConversations);

// Direct LLM routes
router.route('/initialize')
  .post(protect, chatbotController.initializeLLM);

module.exports = router; 