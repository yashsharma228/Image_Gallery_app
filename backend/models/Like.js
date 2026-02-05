const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  image: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Image',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure each user can like an image only once
likeSchema.index({ user: 1, image: 1 }, { unique: true });

module.exports = mongoose.model('Like', likeSchema);
