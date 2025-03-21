const mongoose = require('mongoose');

const MoodSchema = new mongoose.Schema({
  mood: {
    type: Number,
    required: [true, 'Please add a mood rating'],
    min: [1, 'Mood rating must be at least 1'],
    max: [5, 'Mood rating cannot be more than 5']
  },
  notes: {
    type: String,
    trim: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  tags: {
    type: [String],
    default: []
  },
  activities: {
    type: [String],
    default: []
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Mood', MoodSchema); 