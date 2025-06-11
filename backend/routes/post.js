const express = require('express');
const router = express.Router();
const Post = require('../models/post');
const User = require('../models/model');
const auth = require('../middleware/auth');

// Get all posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('postedBy', 'name Photo')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get posts from followed users
router.get('/following', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('following');
    const followingIds = user.following.map(follow => follow._id);

    // Get only the user information of followed users
    const followedUsers = await User.find({ _id: { $in: followingIds } })
      .select('name Photo _id')  // Only select name, Photo, and _id
      .sort({ name: 1 });  // Sort by name

    res.json(followedUsers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new post
router.post('/', auth, async (req, res) => {
  try {
    const { title, body, photo } = req.body;
    const post = new Post({
      title,
      body,
      photo,
      postedBy: req.user._id
    });

    await post.save();
    await post.populate('postedBy', 'name Photo');
    res.status(201).json(post);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get a single post
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('postedBy', 'name Photo')
      .populate('comments.postedBy', 'name Photo');

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a post
router.patch('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to update this post' });
    }

    const { title, body, photo } = req.body;
    if (title) post.title = title;
    if (body) post.body = body;
    if (photo) post.photo = photo;

    await post.save();
    await post.populate('postedBy', 'name Photo');
    res.json(post);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a post
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this post' });
    }

    await post.remove();
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Like/Unlike a post
router.post('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const likeIndex = post.likes.indexOf(req.user._id);
    if (likeIndex === -1) {
      post.likes.push(req.user._id);
    } else {
      post.likes.splice(likeIndex, 1);
    }

    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a comment to a post
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const { text } = req.body;
    post.comments.push({
      text,
      postedBy: req.user._id
    });

    await post.save();
    await post.populate('comments.postedBy', 'name Photo');
    res.json(post.comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get post details
router.get("/post/:postId", auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId)
            .populate("postedBy", "_id name Photo")
            .populate("comments.postedBy", "_id name Photo");
        
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }
        
        res.json(post);
    } catch (err) {
        console.error("Error fetching post:", err);
        res.status(500).json({ error: "Error fetching post" });
  }
});

module.exports = router; 