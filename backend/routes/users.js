const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { adminAuth } = require('../middleware/auth');

// DELETE user by email (admin only)
router.delete('/:email', adminAuth, async (req, res) => {
  try {
    const { email } = req.params;
    const user = await User.findOneAndDelete({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove all comments and likes by this user
    const Comment = require('../models/Comment');
    const Like = require('../models/Like');
    await Comment.deleteMany({ user: user._id });
    await Like.deleteMany({ user: user._id });

    res.json({ message: 'User and related data deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
