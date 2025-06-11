const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const app = express();
const port = process.env.PORT || 4000;
const { mongoUrl } = require("./keys");
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');

// Load models first
require("./models/model");
require("./models/post");
require("./models/video");
require("./models/chat");
require("./models/audiobook");

// Import routes
const audiobookRoutes = require("./routes/audiobook");
const chatRoutes = require("./routes/chat");
const videoRoutes = require("./routes/video");
const authRoutes = require("./routes/auth");
const createPostRoutes = require("./routes/createPost");
const userRoutes = require("./routes/user");
const postRoutes = require("./routes/post");

ffmpeg.setFfmpegPath(ffmpegPath);

// Middleware
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'https://vybes-mern.vercel.app'
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB first
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/vybes', {})
.then(() => {
  console.log('Connected to MongoDB');
  
  // Register routes after MongoDB connection is established
  app.use("/", authRoutes);
  app.use("/", createPostRoutes);
  app.use("/", userRoutes);
  app.use("/audiobooks", audiobookRoutes);
  app.use("/", chatRoutes);
  app.use("/", videoRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/posts', postRoutes);

  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
  });

  // Start server only after routes are registered
  app.listen(port, () => {
    console.log("server is running on port " + port);
  });
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1); // Exit if we can't connect to the database
});

mongoose.connection.on("connected", () => {
  console.log("successfully connected to mongo");
});

mongoose.connection.on("error", () => {
  console.log("not connected to mongodb");
});
