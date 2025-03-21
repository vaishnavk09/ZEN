const mongoose = require('mongoose');

const ChatMessageSchema = new mongoose.Schema({
  message: {
    type: String,
    required: [true, 'Message content is required']
  },
  isUserMessage: {
    type: Boolean,
    default: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  conversationId: {
    type: String,
    required: true
  },
  matchedPattern: {
    type: String,
    default: null
  },
  confidence: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ChatMessage', ChatMessageSchema); 