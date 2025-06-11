const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Audiobook = require("../models/Audiobook");

// Get all audiobooks with genre grouping
router.get("/", async (req, res) => {
  try {
    const { genre, page = 1, limit = 10 } = req.query;
    
    // If genre is specified, get books for that genre
    if (genre) {
      const skip = (page - 1) * limit;
      const audiobooks = await Audiobook.find({ genre })
        .select('title author description genre thumbnailUrl audioUrl duration rating')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));
      
      const total = await Audiobook.countDocuments({ genre });
      
      res.json({
        audiobooks,
        total,
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit)
      });
      return;
    }

    // Get all unique genres
    const genres = await Audiobook.distinct('genre');
    
    // Get books for each genre (limited to 10 per genre for initial load)
    const genreGroups = await Promise.all(
      genres.map(async (genre) => {
        const books = await Audiobook.find({ genre })
          .select('title author description genre thumbnailUrl audioUrl duration rating')
          .sort({ createdAt: -1 })
          .limit(10);
        
        const total = await Audiobook.countDocuments({ genre });
        
        return {
          genre,
          books,
          total,
          hasMore: total > 10
        };
      })
    );

    console.log("MongoDB Response - Genre groups:", genreGroups);
    res.json(genreGroups);
  } catch (err) {
    console.error("Error in /audiobooks route:", err);
    res.status(500).json({ error: "Error fetching audiobooks" });
  }
});

// Get single audiobook
router.get("/audiobook/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid audiobook ID" });
    }

    const audiobook = await Audiobook.findById(req.params.id);
    if (!audiobook) {
      return res.status(404).json({ error: "Audiobook not found" });
    }
    res.json(audiobook);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Error fetching audiobook" });
  }
});

// Add a sample audiobook
// router.post("/add-sample-audiobook", async (req, res) => {
//   try {
//     const sampleAudiobook = new Audiobook({
//       name: "The Psychology of Money",
//       author: "Morgan Housel",
//       description: "Timeless lessons on wealth, greed, and happiness. A fascinating exploration of the strange ways people think about money.",
//       genre: "Self-Development",
//       thumbnailUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
//       audioUrl: "https://res.cloudinary.com/do5w3vlu0/video/upload/v1746974367/brain-im",
//       duration: 7200, // 2 hours in seconds
//       rating: 4.8
//     });

//     const savedAudiobook = await sampleAudiobook.save();
//     console.log("Sample audiobook saved:", savedAudiobook);
//     res.json(savedAudiobook);
//   } catch (err) {
//     console.error("Error adding sample audiobook:", err);
//     res.status(500).json({ error: "Error adding sample audiobook" });
//   }
// });

// // Add multiple sample audiobooks
// router.post("/add-sample-audiobooks", async (req, res) => {
//   try {
//     const sampleAudiobooks = [
//       {
//         title: "The Psychology of Money",
//         author: "Morgan Housel",
//         description: "Timeless lessons on wealth, greed, and happiness. A fascinating exploration of the strange ways people think about money.",
//         thumbnailUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
//         audioUrl: "https://res.cloudinary.com/do5w3vlu0/video/upload/v1746974367/brain-im",
//         duration: 7200,
//         rating: 4.8
//       },
//       {
//         title: "Atomic Habits",
//         author: "James Clear",
//         description: "An easy and proven way to build good habits and break bad ones. Tiny changes, remarkable results.",
//         thumbnailUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
//         audioUrl: "https://res.cloudinary.com/do5w3vlu0/video/upload/v1746974367/brain-im",
//         duration: 5400,
//         rating: 4.9
//       },
//       {
//         title: "The Midnight Library",
//         author: "Matt Haig",
//         description: "Between life and death there is a library. When Nora finds herself in the Midnight Library, she has a chance to make things right.",
//         thumbnailUrl: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
//         audioUrl: "https://res.cloudinary.com/do5w3vlu0/video/upload/v1746974367/brain-im",
//         duration: 6300,
//         rating: 4.5
//       },
//       {
//         title: "Project Hail Mary",
//         author: "Andy Weir",
//         description: "A lone astronaut must save the earth from disaster in this incredible new science-based thriller from the #1 New York Times bestselling author of The Martian.",
//         thumbnailUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
//         audioUrl: "https://res.cloudinary.com/do5w3vlu0/video/upload/v1746974367/brain-im",
//         duration: 9000,
//         rating: 4.7
//       },
//       {
//         title: "Think Like a Monk",
//         author: "Jay Shetty",
//         description: "Train your mind for peace and purpose every day. Learn how to overcome negative thoughts and habits, and access the calm and purpose that lie within all of us.",
//         thumbnailUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
//         audioUrl: "https://res.cloudinary.com/do5w3vlu0/video/upload/v1746974367/brain-im",
//         duration: 8100,
//         rating: 4.6
//       }
//     ];

//     const savedAudiobooks = await Audiobook.insertMany(sampleAudiobooks);
//     console.log("Sample audiobooks saved:", savedAudiobooks.length);
//     res.json(savedAudiobooks);
//   } catch (err) {
//     console.error("Error adding sample audiobooks:", err);
//     res.status(500).json({ error: "Error adding sample audiobooks" });
//   }
// });

module.exports = router;