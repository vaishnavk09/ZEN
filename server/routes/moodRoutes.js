const express = require('express');
const {
  getMoods,
  getMood,
  createMood,
  updateMood,
  deleteMood
} = require('../controllers/moodController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(protect, getMoods)
  .post(protect, createMood);

router.route('/:id')
  .get(protect, getMood)
  .put(protect, updateMood)
  .delete(protect, deleteMood);

module.exports = router; 