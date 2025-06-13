const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  audiobookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Audiobook',
    required: true
  },
  question: {
    type: String,
    required: true,
    trim: true
  },
  options: {
    type: [String],
    required: true,
    validate: {
      validator: function(v) {
        return v.length === 4; // Must have exactly 4 options
      },
      message: 'Question must have exactly 4 options'
    }
  },
  correctAnswer: {
    type: Number,
    required: true,
    min: 0,
    max: 3,
    validate: {
      validator: function(v) {
        return v >= 0 && v <= 3; // Must be 0-3 (index of correct option)
      },
      message: 'Correct answer must be between 0 and 3'
    }
  },
  explanation: {
    type: String,
    trim: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Question", questionSchema); 