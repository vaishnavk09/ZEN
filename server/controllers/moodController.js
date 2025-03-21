const Mood = require('../models/Mood');

// @desc    Get all mood entries for a user
// @route   GET /api/mood
// @access  Private
exports.getMoods = async (req, res, next) => {
  try {
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