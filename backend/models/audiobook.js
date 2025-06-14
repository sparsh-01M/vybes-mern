const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  value: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

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
  ratings: [ratingSchema],
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate average rating before saving
audiobookSchema.pre('save', function(next) {
  console.log('Pre-save middleware triggered');
  console.log('Current ratings:', this.ratings);
  
  if (this.ratings.length > 0) {
    const sum = this.ratings.reduce((acc, rating) => acc + rating.value, 0);
    this.averageRating = sum / this.ratings.length;
    this.totalRatings = this.ratings.length;
    console.log('Pre-save calculated average:', this.averageRating, 'from', this.totalRatings, 'ratings');
  } else {
    this.averageRating = 0;
    this.totalRatings = 0;
    console.log('Pre-save: No ratings, setting defaults');
  }
  next();
});

module.exports = mongoose.model("Audiobook", audiobookSchema);