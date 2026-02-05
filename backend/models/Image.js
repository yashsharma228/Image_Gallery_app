const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true
  },
  publicId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  uploadedDate: {
    type: Date,
    default: Date.now
  },
  likeCount: {
    type: Number,
    default: 0
  }
});

// Index for sorting
imageSchema.index({ uploadedDate: -1 });
imageSchema.index({ likeCount: -1 });

module.exports = mongoose.model('Image', imageSchema);
