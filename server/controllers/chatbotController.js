const ChatMessage = require('../models/ChatMessage');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

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
  const dataPath = path.join(__dirname, '../../client/public/data/kb.json');
  if (fs.existsSync(dataPath)) {
    const rawData = fs.readFileSync(dataPath, 'utf8');
    // Try to parse the JSON, if it fails, use the default dataset
    try {
      const parsedData = JSON.parse(rawData);
      if (parsedData && parsedData.intents) {
        mentalHealthDataset = parsedData;
        console.log('KB dataset loaded successfully in controller');
      }
    } catch (parseError) {
      console.error('Error parsing KB dataset:', parseError);
    }
  } else {
    console.log('KB.json file not found, using default dataset');
  }
} catch (error) {
  console.error('Error loading KB dataset in controller:', error);
}

// Find best response from KB.json dataset
const findBestResponse = (userMessage, conversationId) => {
  // Convert user message to lowercase for better matching
  const message = userMessage.toLowerCase().trim();
  let bestMatch = null;
  let confidence = 0;
  let matchedPattern = '';
  
  // Default response if no dataset or no match found
  let botResponse = "I don't quite understand. Could you rephrase that?";
  
  if (mentalHealthDataset && mentalHealthDataset.intents) {
    // Break the user message into words for more accurate matching
    const userWords = message.split(/\s+/).filter(word => word.length > 2);
    
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
          const patternWords = patternLower.split(/\s+/).filter(word => word.length > 2);
          
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
      
      // Get random response from the matched intent
      const responses = topMatch.intent.responses;
      botResponse = responses[Math.floor(Math.random() * responses.length)];
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
// @route   POST /api/chatbot/conversations/:conversationId/messages
// @access  Private
exports.sendMessage = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a message'
      });
    }
    
    // Create a new conversation if ID not provided
    let actualConversationId = conversationId;
    if (!actualConversationId || actualConversationId === 'new') {
      actualConversationId = uuidv4();
    }
    
    // Use mock data if MongoDB is skipped
    if (process.env.SKIP_MONGO === 'true') {
      const now = new Date();
      
      // Create or update conversation
      if (!mockConversations[actualConversationId]) {
        mockConversations[actualConversationId] = {
          user: req.user.id,
          createdAt: now,
          lastMessageAt: now
        };
      } else {
        mockConversations[actualConversationId].lastMessageAt = now;
      }
      
      // Save user message
      const userMessage = {
        _id: uuidv4(),
        message,
        isUserMessage: true,
        user: req.user.id,
        conversationId: actualConversationId,
        createdAt: now
      };
      
      mockMessages.push(userMessage);
      
      // Generate bot response
      const { response, intent, confidence, matchedPattern } = findBestResponse(message, actualConversationId);
      
      // Save bot response
      const botMessage = {
        _id: uuidv4(),
        message: response,
        isUserMessage: false,
        user: req.user.id,
        conversationId: actualConversationId,
        matchedPattern: matchedPattern,
        confidence: confidence,
        createdAt: new Date(now.getTime() + 1000) // 1 second after user message
      };
      
      mockMessages.push(botMessage);
      
      return res.status(200).json({
        success: true,
        data: {
          conversationId: actualConversationId,
          userMessage,
          botMessage,
          intent,
          confidence
        }
      });
    }
    
    // Save user message
    const userMessage = await ChatMessage.create({
      message,
      isUserMessage: true,
      user: req.user.id,
      conversationId: actualConversationId
    });
    
    // Generate bot response
    const { response, intent, confidence, matchedPattern } = findBestResponse(message, actualConversationId);
    
    // Save bot response
    const botMessage = await ChatMessage.create({
      message: response,
      isUserMessage: false,
      user: req.user.id,
      conversationId: actualConversationId,
      matchedPattern: matchedPattern,
      confidence: confidence
    });
    
    res.status(200).json({
      success: true,
      data: {
        conversationId: actualConversationId,
        userMessage,
        botMessage,
        intent,
        confidence
      }
    });
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
    if (process.env.SKIP_MONGO === 'true') {
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