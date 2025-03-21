const Mood = require('../models/Mood');
const { v4: uuidv4 } = require('uuid');

// Mock data for development when MongoDB is skipped
const mockMoods = [
  {
    _id: uuidv4(),
    mood: 4,
    notes: "Had a productive day at work",
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    tags: ["work", "productive"],
    activities: ["coding", "meeting"],
    user: "demo-user-id",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: uuidv4(),
    mood: 3,
    notes: "Feeling okay today",
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    tags: ["neutral", "regular"],
    activities: ["walking", "reading"],
    user: "demo-user-id",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: uuidv4(),
    mood: 5,
    notes: "Amazing day! Got a promotion",
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    tags: ["work", "success", "happy"],
    activities: ["celebration", "dinner"],
    user: "demo-user-id",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: uuidv4(),
    mood: 2,
    notes: "Feeling a bit down today",
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    tags: ["sad", "tired"],
    activities: ["rest"],
    user: "demo-user-id",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// @desc    Get all mood entries for a user
// @route   GET /api/mood
// @access  Private
exports.getMoods = async (req, res, next) => {
  try {
    // Use mock data if MongoDB is skipped
    if (process.env.SKIP_MONGO === 'true') {
      // Filter moods by user ID
      const userMoods = mockMoods.filter(mood => mood.user === req.user.id);
      
      return res.status(200).json({
        success: true,
        count: userMoods.length,
        data: userMoods
      });
    }
    
    const moods = await Mood.find({ user: req.user.id }).sort({ date: -1 });
    
    res.status(200).json({
      success: true,
      count: moods.length,
      data: moods
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single mood entry
// @route   GET /api/mood/:id
// @access  Private
exports.getMood = async (req, res, next) => {
  try {
    // Use mock data if MongoDB is skipped
    if (process.env.SKIP_MONGO === 'true') {
      const mood = mockMoods.find(m => m._id === req.params.id && m.user === req.user.id);
      
      if (!mood) {
        return res.status(404).json({
          success: false,
          message: 'Mood entry not found'
        });
      }
      
      return res.status(200).json({
        success: true,
        data: mood
      });
    }
    
    const mood = await Mood.findById(req.params.id);
    
    if (!mood) {
      return res.status(404).json({
        success: false,
        message: 'Mood entry not found'
      });
    }
    
    // Make sure user owns the mood entry
    if (mood.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this mood entry'
      });
    }
    
    res.status(200).json({
      success: true,
      data: mood
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new mood entry
// @route   POST /api/mood
// @access  Private
exports.createMood = async (req, res, next) => {
  try {
    // Use mock data if MongoDB is skipped
    if (process.env.SKIP_MONGO === 'true') {
      const newMood = {
        _id: uuidv4(),
        mood: req.body.mood,
        notes: req.body.notes || '',
        date: req.body.date || new Date().toISOString(),
        tags: req.body.tags || [],
        activities: req.body.activities || [],
        user: req.user.id,
        createdAt: new Date().toISOString()
      };
      
      mockMoods.push(newMood);
      
      return res.status(201).json({
        success: true,
        data: newMood
      });
    }
    
    // Add user to req.body
    req.body.user = req.user.id;
    
    const mood = await Mood.create(req.body);
    
    res.status(201).json({
      success: true,
      data: mood
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update mood entry
// @route   PUT /api/mood/:id
// @access  Private
exports.updateMood = async (req, res, next) => {
  try {
    // Use mock data if MongoDB is skipped
    if (process.env.SKIP_MONGO === 'true') {
      const moodIndex = mockMoods.findIndex(m => m._id === req.params.id);
      
      if (moodIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Mood entry not found'
        });
      }
      
      // Make sure user owns the mood entry
      if (mockMoods[moodIndex].user !== req.user.id) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized to update this mood entry'
        });
      }
      
      // Update mood
      const updatedMood = {
        ...mockMoods[moodIndex],
        ...req.body,
        user: req.user.id // Ensure user ID isn't changed
      };
      
      mockMoods[moodIndex] = updatedMood;
      
      return res.status(200).json({
        success: true,
        data: updatedMood
      });
    }
    
    let mood = await Mood.findById(req.params.id);
    
    if (!mood) {
      return res.status(404).json({
        success: false,
        message: 'Mood entry not found'
      });
    }
    
    // Make sure user owns the mood entry
    if (mood.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this mood entry'
      });
    }
    
    mood = await Mood.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: mood
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete mood entry
// @route   DELETE /api/mood/:id
// @access  Private
exports.deleteMood = async (req, res, next) => {
  try {
    // Use mock data if MongoDB is skipped
    if (process.env.SKIP_MONGO === 'true') {
      const moodIndex = mockMoods.findIndex(m => m._id === req.params.id);
      
      if (moodIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Mood entry not found'
        });
      }
      
      // Make sure user owns the mood entry
      if (mockMoods[moodIndex].user !== req.user.id) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized to delete this mood entry'
        });
      }
      
      // Remove mood from array
      mockMoods.splice(moodIndex, 1);
      
      return res.status(200).json({
        success: true,
        data: {}
      });
    }
    
    const mood = await Mood.findById(req.params.id);
    
    if (!mood) {
      return res.status(404).json({
        success: false,
        message: 'Mood entry not found'
      });
    }
    
    // Make sure user owns the mood entry
    if (mood.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this mood entry'
      });
    }
    
    await mood.remove();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
}; 