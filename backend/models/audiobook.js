const mongoose = require("mongoose");

const audiobookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: String,
    required: true,
    trim: true
  },
  genre: {
    type: String,
    required: true,
    trim: true
  },
  thumbnailUrl: {
    type: String,
    required: true,
    trim: true
  },
  audioUrl: {
    type: String,
    required: true,
    trim: true
  },
  duration: {
    type: Number,
    required: true,
    min: 0
  },
  rating: {
    type: Number,
    required: true,
    min: 0,
    max: 5,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Audiobook", audiobookSchema);