const express = require('express');
const Like = require('../models/Like');
const Image = require('../models/Image');
const userAuth = require('../middleware/userAuth');

const router = express.Router();

// Like an image
router.post('/:imageId', userAuth, async (req, res) => {
  try {
    const { imageId } = req.params;
    const userId = req.userId;
    console.log(`[LIKE] User ${userId} liking image ${imageId}`);
    // Prevent duplicate likes
    const existing = await Like.findOne({ user: userId, image: imageId });
    if (existing) {
      console.log('[LIKE] Already liked');
      return res.status(400).json({ message: 'Already liked' });
    }
    const like = new Like({ user: userId, image: imageId });
    await like.save();
    await Image.findByIdAndUpdate(imageId, { $inc: { likeCount: 1 } });
    console.log('[LIKE] Like saved');
    res.status(201).json({ message: 'Liked' });
  } catch (err) {
    console.error('[LIKE] Error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Unlike an image
router.delete('/:imageId', userAuth, async (req, res) => {
  try {
    const { imageId } = req.params;
    const userId = req.userId;
    const like = await Like.findOneAndDelete({ user: userId, image: imageId });
    if (!like) return res.status(404).json({ message: 'Like not found' });
    await Image.findByIdAndUpdate(imageId, { $inc: { likeCount: -1 } });
    res.json({ message: 'Unliked' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});




// Get all liked images for the authenticated user
router.get('/', userAuth, async (req, res) => {
  try {
    const userId = req.userId;
    const sortParam = req.query.sort || 'newest';
    
    console.log(`[GET LIKES] Fetching likes for user ${userId} with sort param: ${sortParam}`);
    
    let likes;
    if (sortParam === 'popular') {
      // If popular, we still fetch all likes first, then sort by image likeCount
      likes = await Like.find({ user: userId }).populate('image');
      likes.sort((a, b) => {
        const countA = a.image?.likeCount || 0;
        const countB = b.image?.likeCount || 0;
        return countB - countA;
      });
    } else {
      const sortOrder = sortParam === 'oldest' ? 1 : -1;
      likes = await Like.find({ user: userId })
        .sort({ createdAt: sortOrder })
        .populate('image');
    }

    console.log(`[GET LIKES] Found ${likes.length} raw like records`);

    const likedImages = likes
      .filter(like => {
        if (!like.image) {
          console.log(`[GET LIKES] Warning: Like record ${like._id} has no associated image (deleted?)`);
          return false;
        }
        return true;
      })
      .map(like => ({
        ...like.image.toObject(),
        isLikedByUser: true,
        likedAt: like.createdAt // Include when it was liked
      }));

    console.log(`[GET LIKES] Returning ${likedImages.length} valid images to frontend`);
    res.json(likedImages);
  } catch (error) {
    console.error('[GET LIKES] Critical Error:', error);
    res.status(500).json({ message: 'Internal server error while fetching collection', error: error.message });
  }
});

module.exports = router;
