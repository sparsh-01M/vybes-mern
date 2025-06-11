const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const requireLogin = require("../middleware/requireLogin");
const { route } = require("./auth");
const POST = mongoose.model("POST")


// Route
router.get("/allposts", requireLogin, (req, res) => {
    console.log("Fetching all posts with comments");
    POST.find()
        .populate("postedBy", "_id name Photo")
        .populate("comments.postedBy", "_id name Photo")  // Added Photo to comments
        .sort("-createdAt")
        .then(posts => {
            console.log("Found posts:", posts.length);
            // Log sample of first post's comments if any
            if (posts.length > 0 && posts[0].comments.length > 0) {
                console.log("Sample comment data:", {
                    commentId: posts[0].comments[0]._id,
                    postedBy: posts[0].comments[0].postedBy ? {
                        id: posts[0].comments[0].postedBy._id,
                        name: posts[0].comments[0].postedBy.name,
                        hasPhoto: !!posts[0].comments[0].postedBy.Photo,
                        photoUrl: posts[0].comments[0].postedBy.Photo
                    } : null
                });
            }
            res.json(posts);
        })
        .catch(err => {
            console.error("Error fetching all posts:", err);
            res.status(500).json({ error: err.message });
        });
})

router.post("/createPost", requireLogin, (req, res) => {
    const { body, pic } = req.body;
    console.log(pic)
    if (!body || !pic) {
        return res.status(422).json({ error: "Please add all the fields" })
    }
    console.log(req.user)
    const post = new POST({
        body,
        photo: pic,
        postedBy: req.user
    })
    post.save().then((result) => {
        return res.json({ post: result })
    }).catch(err => console.log(err))
})

router.get("/myposts", requireLogin, (req, res) => {
    POST.find({ postedBy: req.user._id })
        .populate("postedBy", "_id name")
        .populate("comments.postedBy", "_id name")
        .sort("-createdAt")
        .then(myposts => {
            res.json(myposts)
        })
})

router.put("/like", requireLogin, (req, res) => {
    POST.findByIdAndUpdate(req.body.postId, {
        $push: { likes: req.user._id }
    }, {
        new: true
    }).populate("postedBy", "_id name Photo")
        .exec((err, result) => {
            if (err) {
                return res.status(422).json({ error: err })
            } else {
                res.json(result)
            }
        })
})

router.put("/unlike", requireLogin, (req, res) => {
    POST.findByIdAndUpdate(req.body.postId, {
        $pull: { likes: req.user._id }
    }, {
        new: true
    }).populate("postedBy", "_id name Photo")
        .exec((err, result) => {
            if (err) {
                return res.status(422).json({ error: err })
            } else {
                res.json(result)
            }
        })
})

router.put("/comment", requireLogin, (req, res) => {
    const comment = {
        comment: req.body.text,
        postedBy: req.user._id
    }
    POST.findByIdAndUpdate(req.body.postId, {
        $push: { comments: comment }
    }, {
        new: true
    })
        .populate("comments.postedBy", "_id name")
        .populate("postedBy", "_id name Photo")
        .exec((err, result) => {
            if (err) {
                return res.status(422).json({ error: err })
            } else {
                res.json(result)
            }
        })
})

// Api to delete post
router.delete("/deletePost/:postId", requireLogin, (req, res) => {
    POST.findOne({ _id: req.params.postId })
        .populate("postedBy", "_id")
        .exec((err, post) => {
            if (err || !post) {
                return res.status(422).json({ error: err })
            }

            if (post.postedBy._id.toString() == req.user._id.toString()) {

                post.remove()
                    .then(result => {
                        return res.json({ message: "Successfully deleted" })
                    }).catch((err) => {
                        console.log(err)
                    })
            }
        })
})

// to show following post
router.get("/myfollwingpost", requireLogin, (req, res) => {
    console.log("User following:", req.user.following); // Debug log
    
    POST.find({ postedBy: { $in: req.user.following } })
        .populate("postedBy", "_id name Photo")  // Added Photo to populated fields
        .populate("comments.postedBy", "_id name Photo")  // Added Photo to comments
        .sort("-createdAt")  // Sort by newest first
        .then(posts => {
            console.log("Found posts:", posts.length); // Debug log
            res.json(posts);
        })
        .catch(err => { 
            console.error("Error in myfollwingpost:", err);
            res.status(500).json({ error: err.message });
        });
})

// Get post details
router.get("/post/:postId", requireLogin, async (req, res) => {
    try {
        console.log("Fetching post details for postId:", req.params.postId);
        
        const post = await POST.findById(req.params.postId)
            .populate("postedBy", "_id name Photo")  // Ensure Photo is included
            .populate("comments.postedBy", "_id name Photo");  // Ensure Photo is included for comments
        
        if (!post) {
            console.log("Post not found");
            return res.status(404).json({ error: "Post not found" });
        }
        
        console.log("Post details:", {
            postId: post._id,
            postedBy: post.postedBy ? {
                id: post.postedBy._id,
                name: post.postedBy.name,
                hasPhoto: !!post.postedBy.Photo,
                photoUrl: post.postedBy.Photo
            } : null
        });
        
        res.json(post);
    } catch (err) {
        console.error("Error fetching post:", err);
        res.status(500).json({ error: "Error fetching post" });
    }
});

// Update post
router.put("/updatePost/:postId", requireLogin, async (req, res) => {
    try {
        const { body } = req.body;
        console.log("Updating post:", req.params.postId, "with body:", body);
        
        const post = await POST.findOne({ _id: req.params.postId })
            .populate("postedBy", "_id");
            
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }
        
        // Check if user owns the post
        if (post.postedBy._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: "Not authorized to edit this post" });
        }
        
        // Update the post
        const updatedPost = await POST.findByIdAndUpdate(
            req.params.postId,
            { body },
            { new: true }
        )
        .populate("postedBy", "_id name Photo")
        .populate("comments.postedBy", "_id name Photo");
        
        console.log("Post updated successfully:", {
            postId: updatedPost._id,
            newBody: updatedPost.body
        });
        
        res.json(updatedPost);
    } catch (err) {
        console.error("Error updating post:", err);
        res.status(500).json({ error: "Error updating post" });
    }
});

module.exports = router
