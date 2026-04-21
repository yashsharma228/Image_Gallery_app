const express = require('express');
const Comment = require('../models/Comment');
const Image = require('../models/Image');
const userOrAdminAuth = require('../middleware/userOrAdminAuth');
const userAuth = require('../middleware/userAuth');

const router = express.Router();

// Add a comment (user or admin)
router.post('/:imageId', userOrAdminAuth, async (req, res) => {
	try {
		const { imageId } = req.params;
		const { text } = req.body;
		if (!text) return res.status(400).json({ message: 'Text required' });
		const commentData = { image: imageId, text };
		if (req.userId) commentData.user = req.userId;
		if (req.adminId) commentData.admin = req.adminId;
		if (!commentData.user && !commentData.admin) {
			return res.status(401).json({ message: 'Not authorized to comment.' });
		}
		const comment = new Comment(commentData);
		await comment.save();
		await Image.findByIdAndUpdate(imageId, { $inc: { commentCount: 1 } });
		res.status(201).json(comment);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// Edit a comment
router.put('/:commentId', userAuth, async (req, res) => {
	try {
		const { commentId } = req.params;
		const { text } = req.body;
		const comment = await Comment.findOne({ _id: commentId, user: req.userId });
		if (!comment) return res.status(404).json({ message: 'Comment not found' });
		comment.text = text;
		await comment.save();
		res.json(comment);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// Delete a comment
router.delete('/:commentId', userAuth, async (req, res) => {
	try {
		const { commentId } = req.params;
		const comment = await Comment.findOneAndDelete({ _id: commentId, user: req.userId });
		if (!comment) return res.status(404).json({ message: 'Comment not found' });
		await Image.findByIdAndUpdate(comment.image, { $inc: { commentCount: -1 } });
		res.json({ message: 'Comment deleted' });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// Get all comments for an image (sorted by createdAt ascending)
router.get('/:imageId', async (req, res) => {
	try {
		const { imageId } = req.params;
		const comments = await Comment.find({ image: imageId })
			.populate('user', 'name')
			.populate('admin', 'name')
			.sort({ createdAt: 1 }); // oldest first
		res.json(comments);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

module.exports = router;
