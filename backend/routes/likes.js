const express = require('express');
const Image = require('../models/Image');
const Like = require('../models/Like');
const userAuth = require('../middleware/userAuth');

const router = express.Router();

// Like an image (User only)
router.post('/:imageId/like', userAuth, async (req, res) => {
  try {
    const { imageId } = req.params;
    const userId = req.userId;

    // Check if image exists
    const image = await Image.findById(imageId);
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // Check if already liked
    const existingLike = await Like.findOne({ user: userId, image: imageId });
    if (existingLike) {
      return res.status(400).json({ message: 'Image already liked' });
    }

    // Create like
    const like = new Like({
      user: userId,
      image: imageId
    });
    await like.save();

    // Update like count
    image.likeCount += 1;
    await image.save();

    res.status(201).json({
      message: 'Image liked successfully',
      likeCount: image.likeCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Unlike an image (User only)
router.delete('/:imageId/like', userAuth, async (req, res) => {
  try {
    const { imageId } = req.params;
    const userId = req.userId;

    // Check if like exists
    const like = await Like.findOne({ user: userId, image: imageId });
    if (!like) {
      return res.status(404).json({ message: 'Like not found' });
    }

    // Delete like
    await Like.deleteOne({ _id: like._id });

    // Update like count
    const image = await Image.findById(imageId);
    image.likeCount = Math.max(0, image.likeCount - 1);
    await image.save();

    res.json({
      message: 'Image unliked successfully',
      likeCount: image.likeCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's liked images (User only)
router.get('/', userAuth, async (req, res) => {
  try {
    const userId = req.userId;
    const { sort = 'newest' } = req.query;

    let sortObj = { uploadedDate: -1 };
    if (sort === 'oldest') {
      sortObj = { uploadedDate: 1 };
    } else if (sort === 'popular') {
      sortObj = { likeCount: -1 };
    }

    const likes = await Like.find({ user: userId })
      .populate({
        path: 'image',
        options: { sort: sortObj }
      });

    const likedImages = likes.map(like => ({
      ...like.image.toObject(),
      isLikedByUser: true
    }));

    res.json(likedImages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
