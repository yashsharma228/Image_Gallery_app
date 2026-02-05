const express = require('express');
const Comment = require('../models/Comment');
const Image = require('../models/Image');
const User = require('../models/User');
const userAuth = require('../middleware/userAuth');

const router = express.Router();

// Add a comment to an image
router.post('/:imageId', userAuth, async (req, res) => {
  try {
    const { imageId } = req.params;
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'Comment text required' });
    const image = await Image.findById(imageId);
    if (!image) return res.status(404).json({ message: 'Image not found' });
    const comment = new Comment({
      image: imageId,
      user: req.userId,
      text
    });
    await comment.save();
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all comments for an image
router.get('/:imageId', async (req, res) => {
  try {
    const { imageId } = req.params;
    const comments = await Comment.find({ image: imageId })
      .populate('user', 'name email profilePicture')
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
