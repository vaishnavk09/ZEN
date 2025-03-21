const Journal = require('../models/Journal');

// @desc    Get all journal entries for a user
// @route   GET /api/journal
// @access  Private
exports.getJournals = async (req, res, next) => {
  try {
    const journals = await Journal.find({ user: req.user.id }).sort({ date: -1 });
    
    res.status(200).json({
      success: true,
      count: journals.length,
      data: journals
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single journal entry
// @route   GET /api/journal/:id
// @access  Private
exports.getJournal = async (req, res, next) => {
  try {
    const journal = await Journal.findById(req.params.id);
    
    if (!journal) {
      return res.status(404).json({
        success: false,
        message: 'Journal entry not found'
      });
    }
    
    // Make sure user owns the journal entry
    if (journal.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this journal entry'
      });
    }
    
    res.status(200).json({
      success: true,
      data: journal
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new journal entry
// @route   POST /api/journal
// @access  Private
exports.createJournal = async (req, res, next) => {
  try {
    // Add user to req.body
    req.body.user = req.user.id;
    
    const journal = await Journal.create(req.body);
    
    res.status(201).json({
      success: true,
      data: journal
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update journal entry
// @route   PUT /api/journal/:id
// @access  Private
exports.updateJournal = async (req, res, next) => {
  try {
    let journal = await Journal.findById(req.params.id);
    
    if (!journal) {
      return res.status(404).json({
        success: false,
        message: 'Journal entry not found'
      });
    }
    
    // Make sure user owns the journal entry
    if (journal.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this journal entry'
      });
    }
    
    journal = await Journal.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: journal
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete journal entry
// @route   DELETE /api/journal/:id
// @access  Private
exports.deleteJournal = async (req, res, next) => {
  try {
    const journal = await Journal.findById(req.params.id);
    
    if (!journal) {
      return res.status(404).json({
        success: false,
        message: 'Journal entry not found'
      });
    }
    
    // Make sure user owns the journal entry
    if (journal.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this journal entry'
      });
    }
    
    await journal.remove();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
}; 