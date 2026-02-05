const express = require('express');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const Image = require('../models/Image');
const Like = require('../models/Like');
const { adminAuth, userAuth } = require('../middleware/auth');

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Upload Image (Admin only)
router.post('/upload', adminAuth, upload.single('image'), [
  body('title').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file provided' });
    }

    // Upload to Cloudinary with compression and optimization
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { 
          folder: 'image-gallery',
          transformation: [
            { quality: 'auto:good' }, // Auto quality optimization
            { fetch_format: 'auto' }, // Auto format (webp when supported)
            { width: 1920, height: 1080, crop: 'limit' } // Limit max dimensions
          ],
          resource_type: 'image'
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    // Save image metadata to database
    const image = new Image({
      url: result.secure_url,
      publicId: result.public_id,
      title: req.body.title,
      description: req.body.description || '',
      uploadedBy: req.adminId
    });

    await image.save();

    res.status(201).json({
      message: 'Image uploaded successfully',
      image: {
        id: image._id,
        url: image.url,
        title: image.title,
        uploadedDate: image.uploadedDate
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading image', error: error.message });
  }
});

// Get All Images (with sorting, search, filter)
router.get('/', async (req, res) => {
  try {
    const { sort = 'newest', userId, search = '', title = '', description = '' } = req.query;
    let sortObj = { uploadedDate: -1 };

    if (sort === 'oldest') {
      sortObj = { uploadedDate: 1 };
    } else if (sort === 'popular') {
      sortObj = { likeCount: -1 };
    }

    // Build filter object
    const filter = {};
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (title) {
      filter.title = { $regex: title, $options: 'i' };
    }
    if (description) {
      filter.description = { $regex: description, $options: 'i' };
    }

    let images = await Image.find(filter)
      .sort(sortObj)
      .populate('uploadedBy', 'name email')
      .lean();

    // For each image, get users who liked it
    const imageIds = images.map(img => img._id);
    const likes = await Like.find({ image: { $in: imageIds } })
      .populate('user', 'name email')
      .lean();

    // Map imageId to array of users who liked it
    const likesMap = {};
    likes.forEach(like => {
      const imgId = like.image.toString();
      if (!likesMap[imgId]) likesMap[imgId] = [];
      likesMap[imgId].push(like.user);
    });

    images = images.map(image => ({
      ...image,
      likedByUsers: likesMap[image._id.toString()] || []
    }));

    // If user is authenticated, include their like status
    if (userId) {
      const userLikes = await Like.find({ user: userId }).select('image');
      const likedImageIds = userLikes.map(like => like.image.toString());
      images = images.map(image => ({
        ...image,
        isLikedByUser: likedImageIds.includes(image._id.toString())
      }));
    }

    res.json(images);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Single Image
router.get('/:id', async (req, res) => {
  try {
    const image = await Image.findById(req.params.id)
      .populate('uploadedBy', 'name email');
    
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    res.json(image);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Edit Image (Admin only)
router.put('/:id', adminAuth, [
  body('title').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const image = await Image.findById(req.params.id);
    
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    image.title = req.body.title || image.title;
    image.description = req.body.description || image.description;
    await image.save();

    res.json({
      message: 'Image updated successfully',
      image
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete Image (Admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(image.publicId);

    // Delete from database
    await Image.findByIdAndDelete(req.params.id);
    
    // Delete all likes for this image
    await Like.deleteMany({ image: req.params.id });

    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
