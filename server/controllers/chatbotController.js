const ChatMessage = require('../models/ChatMessage');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const asyncHandler = require('express-async-handler');
const axios = require('axios');

// Mock data for when MongoDB is skipped
const mockConversations = {};
const mockMessages = [];

// Load the KB.json dataset
let mentalHealthDataset = {
  intents: [
    {
      tag: "greeting",
      patterns: ["hi", "hello", "hey", "how are you"],
      responses: ["Hello! How can I help you today?", "Hi there! How are you feeling today?", "Hey! What brings you here today?"]
    },
    {
      tag: "fallback",
      patterns: [],
      responses: ["I'm not sure I understand. Could you rephrase that?", "I didn't quite catch that. Can you explain differently?"]
    }
  ]
};

try {
  // Use the dataset from the specified location
  const dataPath = 'C:/Users/vaish/mindfulme-app/src/assets/KB.json';
  
  if (fs.existsSync(dataPath)) {
    try {
      // Read the file with explicit UTF-8 encoding
      let rawData = fs.readFileSync(dataPath, 'utf8');
      
      // Remove BOM if present and clean up non-standard characters
      rawData = rawData.replace(/^\uFEFF/, '');
      rawData = rawData.replace(/[\u200B-\u200D\uFEFF]/g, '');
      rawData = rawData.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
      
      // Parse the JSON
      const parsedData = JSON.parse(rawData);
      if (parsedData && parsedData.intents) {
        mentalHealthDataset = parsedData;
        console.log('KB dataset loaded successfully in controller');
      }
    } catch (readError) {
      console.error('Error reading KB dataset file:', readError);
      // Continue with default dataset defined earlier
    }
  } else {
    console.log('KB.json file not found at specified path, using default dataset');
  }
} catch (error) {
  console.error('Error in KB dataset loading process:', error);
}

// Keep track of conversation context
const conversationContext = {};

// Find best response from KB.json dataset
const findBestResponse = (userMessage, conversationId) => {
  // Convert user message to lowercase for better matching
  const message = userMessage.toLowerCase().trim();
  let bestMatch = null;
  let confidence = 0;
  let matchedPattern = '';
  
  // Default response if no dataset or no match found
  let botResponse = "I'm not sure I understand. Could you rephrase that?";
  
  // Initialize conversation context if it doesn't exist
  if (!conversationContext[conversationId]) {
    conversationContext[conversationId] = {
      lastIntent: null,
      mentionedTopics: new Set(),
      messageCount: 0
    };
  }
  
  // Update message count
  conversationContext[conversationId].messageCount++;
  
  if (mentalHealthDataset && mentalHealthDataset.intents) {
    // Break the user message into words for more accurate matching
    const userWords = message.split(/\s+/)
      .filter(word => word.length > 2)
      .map(word => word.replace(/[.,?!;:'"()]/g, ''));
    
    // Track all intents with their match scores
    const scoredIntents = [];
    
    // Score each intent based on pattern matching
    for (const intent of mentalHealthDataset.intents) {
      let intentScore = 0;
      let bestPatternScore = 0;
      let matchPattern = '';
      
      // Check each pattern in the intent
      for (const pattern of intent.patterns) {
        const patternLower = pattern.toLowerCase();
        let patternScore = 0;
        
        // Exact match gets highest score
        if (message === patternLower) {
          patternScore = 100;
          if (patternScore > bestPatternScore) {
            bestPatternScore = patternScore;
            matchPattern = pattern;
          }
        }
        // Contains full pattern
        else if (message.includes(patternLower)) {
          patternScore = 50;
          if (patternScore > bestPatternScore) {
            bestPatternScore = patternScore;
            matchPattern = pattern;
          }
        }
        // Pattern contains message
        else if (patternLower.includes(message)) {
          patternScore = 30;
          if (patternScore > bestPatternScore) {
            bestPatternScore = patternScore;
            matchPattern = pattern;
          }
        }
        else {
          // Check for word matches
          const patternWords = patternLower.split(/\s+/)
            .filter(word => word.length > 2)
            .map(word => word.replace(/[.,?!;:'"()]/g, ''));
          
          // Score based on matching words
          for (const userWord of userWords) {
            if (patternWords.includes(userWord)) {
              patternScore += 10;
            }
            // Check for partial word matches (beginning of words)
            else {
              for (const patternWord of patternWords) {
                if (patternWord.startsWith(userWord) || userWord.startsWith(patternWord)) {
                  patternScore += 5;
                }
              }
            }
          }
          
          // Keep track of the best pattern score for this intent
          if (patternScore > bestPatternScore) {
            bestPatternScore = patternScore;
            matchPattern = pattern;
          }
        }
      }
      
      // Use the best pattern score for this intent
      intentScore = bestPatternScore;
      
      // Special handling for common scenarios
      if (intent.tag === "greeting" && /^(hi|hello|hey|greetings)/i.test(message)) {
        intentScore += 20;
      }
      if (intent.tag === "thanks" && /thank|thanks|appreciate/i.test(message)) {
        intentScore += 20;
      }
      if (intent.tag === "goodbye" && /bye|goodbye|see you|later/i.test(message)) {
        intentScore += 20;
      }
      if (intent.tag === "anxiety" && /anxious|anxiety|worried|panic|stress/i.test(message)) {
        intentScore += 20;
      }
      if (intent.tag === "depression" && /depress|sad|down|hopeless|unhappy/i.test(message)) {
        intentScore += 20;
      }
      if (intent.tag === "sleep" && /sleep|insomnia|awake|bed|night/i.test(message)) {
        intentScore += 20;
      }
      if (intent.tag === "meditation" && /meditat|mindful|breathe|calm|focus/i.test(message)) {
        intentScore += 20;
      }
      if (intent.tag === "self_care" && /self care|self-care|care for myself|taking care/i.test(message)) {
        intentScore += 20;
      }
      
      // Context-based boosting - if this is related to the previous intent
      if (conversationContext[conversationId].lastIntent === intent.tag) {
        intentScore += 15; // Boost for conversation continuity
      }
      
      // If we've mentioned this topic before
      if (conversationContext[conversationId].mentionedTopics.has(intent.tag)) {
        intentScore += 10; // Boost for returning to a previously discussed topic
      }
      
      // Add to scored intents if it has any score
      if (intentScore > 0) {
        scoredIntents.push({ 
          intent, 
          score: intentScore,
          matchedPattern: matchPattern 
        });
      }
    }
    
    // Sort intents by score (highest first)
    scoredIntents.sort((a, b) => b.score - a.score);
    
    if (scoredIntents.length > 0) {
      // Use the highest scoring intent
      const topMatch = scoredIntents[0];
      bestMatch = topMatch.intent.tag;
      confidence = topMatch.score;
      matchedPattern = topMatch.matchedPattern;
      
      // Update conversation context
      conversationContext[conversationId].lastIntent = bestMatch;
      conversationContext[conversationId].mentionedTopics.add(bestMatch);
      
      // Get random response from the matched intent
      const responses = topMatch.intent.responses;
      botResponse = responses[Math.floor(Math.random() * responses.length)];
      
      // For greeting after first message, add personalization
      if (bestMatch === "greeting" && conversationContext[conversationId].messageCount > 1) {
        botResponse = "Hello again! " + botResponse.replace(/^Hello!|Hi there!|Greetings!|Hi!/i, "");
      }
      
    } else {
      // If no good match, use fallback intent
      const fallbackIntent = mentalHealthDataset.intents.find(intent => intent.tag === "fallback");
      if (fallbackIntent) {
        bestMatch = "fallback";
        confidence = 0;
        botResponse = fallbackIntent.responses[Math.floor(Math.random() * fallbackIntent.responses.length)];
      }
    }
  }
  
  return {
    response: botResponse,
    intent: bestMatch,
    confidence,
    matchedPattern
  };
};

// @desc    Get all chat messages for a user by conversation
// @route   GET /api/chatbot/conversations/:conversationId
// @access  Private
exports.getConversation = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    
    // Use mock data if MongoDB is skipped
    if (process.env.SKIP_MONGO === 'true') {
      const messages = mockMessages.filter(
        msg => msg.conversationId === conversationId && msg.user === req.user.id
      ).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      
      return res.status(200).json({
        success: true,
        count: messages.length,
        data: messages
      });
    }
    
    const messages = await ChatMessage.find({ 
      user: req.user.id,
      conversationId
    }).sort({ createdAt: 1 });
    
    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all conversations for a user
// @route   GET /api/chatbot/conversations
// @access  Private
exports.getConversations = async (req, res, next) => {
  try {
    // Use mock data if MongoDB is skipped
    if (process.env.SKIP_MONGO === 'true') {
      // Get unique conversation IDs
      const conversations = Object.keys(mockConversations)
        .filter(convId => mockConversations[convId].user === req.user.id)
        .map(convId => ({
          _id: convId,
          conversationId: convId,
          createdAt: mockConversations[convId].createdAt,
          lastMessageAt: mockConversations[convId].lastMessageAt,
          messageCount: mockMessages.filter(msg => msg.conversationId === convId).length
        }))
        .sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
      
      return res.status(200).json({
        success: true,
        count: conversations.length,
        data: conversations
      });
    }
    
    // Aggregate to get unique conversation IDs with their first message time
    const conversations = await ChatMessage.aggregate([
      { $match: { user: req.user._id } },
      { $sort: { createdAt: 1 } },
      { $group: {
          _id: "$conversationId",
          createdAt: { $first: "$createdAt" },
          lastMessageAt: { $last: "$createdAt" },
          messageCount: { $sum: 1 }
        }
      },
      { $sort: { lastMessageAt: -1 } }
    ]);
    
    res.status(200).json({
      success: true,
      count: conversations.length,
      data: conversations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Start a new conversation
// @route   POST /api/chatbot/conversations
// @access  Private
exports.startConversation = async (req, res, next) => {
  try {
    const conversationId = uuidv4();
    
    // Find a greeting response from the dataset
    let greeting = "Hello! How can I help you today?";
    const greetingIntent = mentalHealthDataset.intents.find(intent => intent.tag === "greeting");
    if (greetingIntent && greetingIntent.responses && greetingIntent.responses.length > 0) {
      greeting = greetingIntent.responses[Math.floor(Math.random() * greetingIntent.responses.length)];
    }
    
    // Use mock data if MongoDB is skipped
    if (process.env.SKIP_MONGO === 'true') {
      const now = new Date();
      
      // Create conversation record
      mockConversations[conversationId] = {
        user: req.user.id,
        createdAt: now,
        lastMessageAt: now
      };
      
      // Create initial bot message
      const botMessage = {
        _id: uuidv4(),
        message: greeting,
        isUserMessage: false,
        user: req.user.id,
        conversationId,
        matchedPattern: "greeting",
        confidence: 100,
        createdAt: now
      };
      
      mockMessages.push(botMessage);
      
      return res.status(201).json({
        success: true,
        data: {
          conversationId,
          message: botMessage
        }
      });
    }
    
    // Create initial bot message
    const botMessage = await ChatMessage.create({
      message: greeting,
      isUserMessage: false,
      user: req.user.id,
      conversationId,
      matchedPattern: "greeting",
      confidence: 100
    });
    console.log('ChatMessage saved to MongoDB:', botMessage);
    
    res.status(201).json({
      success: true,
      data: {
        conversationId,
        message: botMessage
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send message to chatbot and get response
// @route   POST /api/chatbot/message
// @access  Private
exports.sendMessage = async (req, res, next) => {
  try {
    const { message, conversationId } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a message'
      });
    }
    
    if (!conversationId) {
      return res.status(400).json({
        success: false,
        error: 'Conversation ID is required'
      });
    }

    // Use the LLM service regardless of MongoDB setting
    try {
      // Save user message to MongoDB
      const userMessageObj = await ChatMessage.create({
        message: message,
        isUserMessage: true,
        user: req.user.id,
        conversationId,
        createdAt: new Date()
      });
      console.log('User message saved to MongoDB:', userMessageObj);
      
      // Hardcode the Python service URL
      const pythonServiceUrl = 'http://localhost:8000';
      console.log(`Connecting to Python service at: ${pythonServiceUrl}/chat`);
      
      let botResponse;
      let intent; // To store the intent from the LLM/KB
      try {
        // Direct API call to the Python service
        const response = await axios.post(`${pythonServiceUrl}/chat`, { message });
        botResponse = response.data.response;
        intent = response.data.intent; // Assuming the LLM service returns intent
        console.log('Successfully received response from Python service');
      } catch (apiError) {
        console.error(`API call failed: ${apiError.message}`);
        // Fallback response if API call fails
        botResponse = "I apologize, but I'm having trouble connecting to my reasoning service right now. Let me suggest a breathing exercise to help in the meantime: Try box breathing - inhale for 4 counts, hold for 4, exhale for 4, hold for 4, and repeat. This can help reduce anxiety and stress.";
        intent = "fallback"; // Default intent if API call fails
      }
      
      // Add breathing exercises link if relevant
      const breathingAdviceIntents = ['anxiety', 'panic', 'stress', 'overwhelmed'];
      if (breathingAdviceIntents.includes(intent)) {
        botResponse += "\n\nI notice you're feeling anxious or stressed. Would you like to try one of our guided breathing exercises? [Click here to access our breathing exercises](/breathing-exercises)";
      }
      
      // Save bot message to MongoDB
      const botMessage = await ChatMessage.create({
        message: botResponse,
        isUserMessage: false,
        user: req.user.id,
        conversationId,
        createdAt: new Date()
      });
      console.log('Bot message saved to MongoDB:', botMessage);
      
      return res.status(200).json({
        success: true,
        data: {
          conversationId,
          userMessage: userMessageObj,
          botMessage,
          llmResponse: true
        }
      });
    } catch (error) {
      console.error(`General error in sendMessage: ${error.message}`);
      return res.status(500).json({
        success: false,
        error: 'Server error processing message'
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Clear a specific conversation
// @route   DELETE /api/chatbot/conversations/:conversationId
// @access  Private
exports.clearConversation = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    
    // Use mock data if MongoDB is skipped
    if (process.env.SKIP_MONGO === 'true') {
      // Remove conversation entry
      if (mockConversations[conversationId]) {
        delete mockConversations[conversationId];
      }
      
      // Filter out messages for this conversation
      const initialLength = mockMessages.length;
      // Use splice to remove matching messages instead of reassigning the array
      for (let i = mockMessages.length - 1; i >= 0; i--) {
        const msg = mockMessages[i];
        if (msg.conversationId === conversationId && msg.user === req.user.id) {
          mockMessages.splice(i, 1);
        }
      }
      
      return res.status(200).json({
        success: true,
        data: {}
      });
    }
    
    await ChatMessage.deleteMany({ 
      user: req.user.id,
      conversationId
    });
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear all conversations
// @route   DELETE /api/chatbot/conversations
// @access  Private
exports.clearAllConversations = async (req, res, next) => {
  try {
    // Use mock data if MongoDB is skipped
    if (process.env.SKIP_MONGO === 'false') {
      // Remove all user's conversations
      Object.keys(mockConversations).forEach(convId => {
        if (mockConversations[convId].user === req.user.id) {
          delete mockConversations[convId];
        }
      });
      
      // Filter out all user's messages
      for (let i = mockMessages.length - 1; i >= 0; i--) {
        if (mockMessages[i].user === req.user.id) {
          mockMessages.splice(i, 1);
        }
      }
      
      return res.status(200).json({
        success: true,
        data: {}
      });
    }
    
    await ChatMessage.deleteMany({ user: req.user.id });
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';

// @desc    Initialize the LLM service
// @route   POST /api/chatbot/initialize
// @access  Private
const initializeLLM = asyncHandler(async (req, res) => {
    try {
        const response = await axios.post(`${PYTHON_SERVICE_URL}/initialize`);
        res.status(200).json(response.data);
    } catch (error) {
        res.status(500);
        throw new Error('Error initializing LLM service: ' + error.message);
    }
});

// @desc    Process chat message and get response from LLM
// @route   POST /api/chatbot
// @access  Private
const processChatMessage = asyncHandler(async (req, res) => {
    const { message } = req.body;

    if (!message) {
        res.status(400);
        throw new Error('Please provide a message');
    }

    try {
        console.log(`Sending request to Python LLM service at ${PYTHON_SERVICE_URL}/chat`);
        console.log(`Message: ${message}`);
        
        const response = await axios.post(`${PYTHON_SERVICE_URL}/chat`, {
            message
        });
        
        console.log(`Received response from Python LLM service: ${JSON.stringify(response.data)}`);
        
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error processing chat message:', error);
        res.status(500);
        throw new Error('Error processing chat message: ' + (error.response?.data?.message || error.message));
    }
});

module.exports = {
    getConversation: exports.getConversation,
    getConversations: exports.getConversations,
    startConversation: exports.startConversation,
    sendMessage: exports.sendMessage,
    clearConversation: exports.clearConversation,
    clearAllConversations: exports.clearAllConversations,
    initializeLLM,
    processChatMessage
}; 