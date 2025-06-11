const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const requireLogin = require("../middleware/requireLogin");
const multer = require('multer');
const path = require('path');
const cloudinary = require('../config/cloudinary');
const { Readable } = require('stream');

// Get the model after it's registered
const getVideoModel = () => mongoose.model("VIDEO");
const getUserModel = () => mongoose.model("USER");

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB for videos
    files: 2 // Allow up to 2 files (video and thumbnail)
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'video') {
      if (file.mimetype.startsWith('video/')) {
        cb(null, true);
      } else {
        cb(new Error('Only video files are allowed'));
      }
    } else if (file.fieldname === 'thumbnail') {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed'));
      }
    }
  }
});

// Helper function to upload file to Cloudinary
const uploadToCloudinary = (file, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "auto",
        ...options
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    const stream = Readable.from(file.buffer);
    stream.pipe(uploadStream);
  });
};

// Get all videos with search and sort
router.get("/allvideos", async (req, res) => {
  try {
    const { q: query, sort } = req.query;
    let searchQuery = {};

    if (query) {
      searchQuery = {
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } }
        ]
      };
    }

    let sortQuery = {};
    switch (sort) {
      case 'oldest':
        sortQuery = { createdAt: 1 };
        break;
      case 'mostViewed':
        sortQuery = { views: -1 };
        break;
      case 'mostLiked':
        sortQuery = { 'likes.length': -1 };
        break;
      default: // newest
        sortQuery = { createdAt: -1 };
    }

    const VideoModel = getVideoModel();
    const videos = await VideoModel.find(searchQuery)
      .sort(sortQuery)
      .populate("postedBy", "_id name profilePic")
      .lean();

    res.json(videos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get videos from followed users
router.get("/followingvideos", requireLogin, async (req, res) => {
  try {
    const UserModel = getUserModel();
    const VideoModel = getVideoModel();
    const user = await UserModel.findById(req.user._id).populate("following");
    const followingIds = user.following.map(follow => follow._id);

    const videos = await VideoModel.find({ postedBy: { $in: followingIds } })
      .sort({ createdAt: -1 })
      .populate("postedBy", "_id name profilePic")
      .lean();

    res.json(videos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload a new video
router.post("/upload", requireLogin, upload.fields([
  { name: 'video', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]), async (req, res) => {
  try {
    console.log('Upload request received:', {
      body: req.body,
      files: req.files,
      user: req.user
    });

    if (!req.files || !req.files.video || !req.files.thumbnail) {
      console.log('Missing files in request:', req.files);
      return res.status(400).json({ error: 'Both video and thumbnail files are required' });
    }

    const { title, description } = req.body;
    if (!title || !description) {
      console.log('Missing title or description:', { title, description });
      return res.status(400).json({ error: 'Title and description are required' });
    }

    // Upload video to Cloudinary
    console.log('Uploading video to Cloudinary...');
    const videoResult = await uploadToCloudinary(req.files.video[0], {
      resource_type: "video",
      folder: "vybes/videos",
      chunk_size: 6000000, // 6MB chunks for better upload
      eager: [
        { format: "mp4", quality: "auto" }
      ]
    });

    // Upload thumbnail to Cloudinary
    console.log('Uploading thumbnail to Cloudinary...');
    const thumbnailResult = await uploadToCloudinary(req.files.thumbnail[0], {
      folder: "vybes/thumbnails",
      transformation: [
        { width: 1280, height: 720, crop: "fill" },
        { quality: "auto" }
      ]
    });

    console.log('Cloudinary upload results:', {
      video: videoResult,
      thumbnail: thumbnailResult
    });

    // Create video document
    const VideoModel = getVideoModel();
    const video = new VideoModel({
      title,
      description,
      videoUrl: videoResult.secure_url,
      thumbnailUrl: thumbnailResult.secure_url,
      cloudinaryVideoId: videoResult.public_id,
      cloudinaryThumbnailId: thumbnailResult.public_id,
      postedBy: req.user._id
    });

    await video.save();
    await video.populate("postedBy", "_id name profilePic");
    console.log('Video saved successfully:', video);
    res.json(video);
  } catch (error) {
    console.error('Error in upload route:', error);
    res.status(400).json({ error: error.message });
  }
});

// Upload a new reel
router.post("/upload-reel", requireLogin, upload.fields([
  { name: 'video', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]), async (req, res) => {
  try {
    console.log('Reel upload request received:', {
      body: req.body,
      files: req.files,
      user: req.user
    });

    if (!req.files || !req.files.video || !req.files.thumbnail) {
      console.log('Missing files in request:', req.files);
      return res.status(400).json({ error: 'Both video and thumbnail files are required' });
    }

    const { title, description, category } = req.body;
    if (!title || !description || !category) {
      console.log('Missing title, description, or category:', { title, description, category });
      return res.status(400).json({ error: 'Title, description, and category are required' });
    }

    // Upload video to Cloudinary
    console.log('Uploading reel to Cloudinary...');
    const videoResult = await uploadToCloudinary(req.files.video[0], {
      resource_type: "video",
      folder: "vybes/reels",
      chunk_size: 6000000, // 6MB chunks for better upload
      eager: [
        { format: "mp4", quality: "auto" }
      ]
    });

    // Upload thumbnail to Cloudinary
    console.log('Uploading thumbnail to Cloudinary...');
    const thumbnailResult = await uploadToCloudinary(req.files.thumbnail[0], {
      folder: "vybes/thumbnails",
      transformation: [
        { width: 1280, height: 720, crop: "fill" },
        { quality: "auto" }
      ]
    });

    console.log('Cloudinary upload results:', {
      video: videoResult,
      thumbnail: thumbnailResult
    });

    // Create reel document
    const VideoModel = getVideoModel();
    const reel = new VideoModel({
      title,
      description,
      videoUrl: videoResult.secure_url,
      thumbnailUrl: thumbnailResult.secure_url,
      cloudinaryVideoId: videoResult.public_id,
      cloudinaryThumbnailId: thumbnailResult.public_id,
      postedBy: req.user._id,
      category
    });

    await reel.save();
    await reel.populate("postedBy", "_id name profilePic");
    console.log('Reel saved successfully:', reel);
    res.json(reel);
  } catch (error) {
    console.error('Error in reel upload route:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get user's videos
router.get("/myvideos", requireLogin, async (req, res) => {
  try {
    const VideoModel = getVideoModel();
    const videos = await VideoModel.find({ postedBy: req.user._id })
      .sort({ createdAt: -1 })
      .populate("postedBy", "_id name profilePic")
      .lean();
    res.json(videos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Like/Unlike a video
router.put("/like", requireLogin, async (req, res) => {
  try {
    const VideoModel = getVideoModel();
    const video = await VideoModel.findById(req.body.videoId);
    
    if (!video) {
      return res.status(404).json({ error: "Video not found" });
    }

    if (video.likes.includes(req.user._id)) {
      video.likes = video.likes.filter(id => id.toString() !== req.user._id.toString());
    } else {
      video.likes.push(req.user._id);
    }

    await video.save();
    res.json(video);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add comment to video
router.put("/comment", requireLogin, async (req, res) => {
  try {
    const VideoModel = getVideoModel();
    const comment = {
      text: req.body.text,
      postedBy: req.user._id
    };

    const video = await VideoModel.findByIdAndUpdate(
      req.body.videoId,
      { $push: { comments: comment } },
      { new: true }
    ).populate("comments.postedBy", "_id name profilePic")
     .populate("postedBy", "_id name profilePic");

    res.json(video);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a video
router.delete("/delete/:videoId", requireLogin, async (req, res) => {
  try {
    const VideoModel = getVideoModel();
    const video = await VideoModel.findOne({ _id: req.params.videoId })
      .populate("postedBy", "_id");

    if (!video) {
      return res.status(404).json({ error: "Video not found" });
    }

    if (video.postedBy._id.toString() !== req.user._id.toString()) {
      return res.status(401).json({ error: "You can't delete this video" });
    }

    // Delete from Cloudinary
    try {
      await cloudinary.uploader.destroy(video.cloudinaryVideoId, { resource_type: "video" });
      await cloudinary.uploader.destroy(video.cloudinaryThumbnailId);
    } catch (cloudinaryError) {
      console.error('Error deleting from Cloudinary:', cloudinaryError);
      // Continue with deletion even if Cloudinary deletion fails
    }

    await video.deleteOne();
    res.json({ message: "Video deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get videos by user ID
router.get("/user/:userId", async (req, res) => {
  try {
    const VideoModel = getVideoModel();
    const videos = await VideoModel.find({ postedBy: req.params.userId })
      .sort({ createdAt: -1 })
      .populate("postedBy", "_id name profilePic")
      .lean();
    res.json(videos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 