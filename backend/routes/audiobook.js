// const express = require('express');
// const router = express.Router();
// const mongoose = require('mongoose');
// const Audiobook = mongoose.model("Audiobook");

// // Get all audiobooks with pagination
// router.get('/api/audiobooks', async (req, res) => {
//     try {
//         const page = parseInt(req.query.page) || 1;
//         const limit = parseInt(req.query.limit) || 10;
//         const skip = (page - 1) * limit;
        
//         const audiobooks = await Audiobook.find()
//             .skip(skip)
//             .limit(limit)
//             .sort({ publishedDate: -1 });
        
//         const total = await Audiobook.countDocuments();
        
//         res.json({
//             audiobooks,
//             currentPage: page,
//             totalPages: Math.ceil(total / limit),
//             totalAudiobooks: total
//         });
//     } catch (err) {
//         res.status(500).json({ message: err.message });
//     }
// });

// // Get single audiobook
// router.get('/api/audiobooks/:id', async (req, res) => {
//     try {
//         const audiobook = await Audiobook.findById(req.params.id);
//         if (!audiobook) return res.status(404).json({ message: 'Audiobook not found' });
//         res.json(audiobook);
//     } catch (err) {
//         res.status(500).json({ message: err.message });
//     }
// });

// // Add new audiobook
// router.post('/api/audiobooks', async (req, res) => {
//     try {
//         console.log('Adding new audiobook:', req.body);
//         const newAudiobook = new Audiobook(req.body);
//         const savedAudiobook = await newAudiobook.save();
//         console.log('Successfully added audiobook with ID:', savedAudiobook._id);
//         res.status(201).json(savedAudiobook);
//     } catch (err) {
//         console.error('Error adding audiobook:', err);
//         res.status(400).json({ message: err.message });
//     }
// });

// // Update audiobook
// router.put('/api/audiobooks/:id', async (req, res) => {
//     try {
//         const updatedAudiobook = await Audiobook.findByIdAndUpdate(
//             req.params.id,
//             req.body,
//             { new: true }
//         );
//         if (!updatedAudiobook) return res.status(404).json({ message: 'Audiobook not found' });
//         res.json(updatedAudiobook);
//     } catch (err) {
//         res.status(400).json({ message: err.message });
//     }
// });

// // Delete audiobook
// router.delete('/api/audiobooks/:id', async (req, res) => {
//     try {
//         const deletedAudiobook = await Audiobook.findByIdAndDelete(req.params.id);
//         if (!deletedAudiobook) return res.status(404).json({ message: 'Audiobook not found' });
//         res.json({ message: 'Audiobook deleted' });
//     } catch (err) {
//         res.status(500).json({ message: err.message });
//     }
// });

// module.exports = router;