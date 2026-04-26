const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');
const firebaseAdmin = require('../firebaseAdmin');
const Admin = require('../models/Admin');
const User = require('../models/User');
const { adminAuth, getTokenFromRequest } = require('../middleware/auth');

const router = express.Router();
const isProd = process.env.NODE_ENV === 'production';
const cookieOpts7d = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000
};

// Admin Login
router.post('/admin/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { email, password } = req.body;
    const adminUser = await Admin.findOne({ email });
    if (!adminUser) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const isPasswordValid = await adminUser.matchPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign(
      { id: adminUser._id, email: adminUser.email, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.cookie('admin_token', token, cookieOpts7d);
    res.json({
      success: true,
      token,
      admin: { id: adminUser._id, email: adminUser.email, name: adminUser.name }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Admin Register
router.post('/admin/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').notEmpty().trim()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { email, password, name } = req.body;
    let adminUser = await Admin.findOne({ email });
    if (adminUser) {
      return res.status(400).json({ message: 'Admin with this email already exists' });
    }
    adminUser = new Admin({ email, password, name });
    await adminUser.save();
    const token = jwt.sign(
      { id: adminUser._id, email: adminUser.email, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.cookie('admin_token', token, cookieOpts7d);
    res.status(201).json({
      success: true,
      message: 'Admin registered successfully',
      admin: { id: adminUser._id, email: adminUser.email, name: adminUser.name }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Admin Firebase Login (Google)
router.post('/admin/firebase-login', async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ message: 'No idToken provided' });
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
    const { uid, email, name } = decodedToken;
    let adminUser = await Admin.findOne({
      $or: [{ firebaseUid: uid }, { email: email.toLowerCase() }]
    });
    if (!adminUser) {
      return res.status(403).json({ message: 'User is not registered as an Admin' });
    }
    if (!adminUser.firebaseUid) {
      adminUser.firebaseUid = uid;
      await adminUser.save();
    }
    const token = jwt.sign(
      { id: adminUser._id, email: adminUser.email, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.cookie('admin_token', token, cookieOpts7d);
    res.json({
      success: true,
      token,
      admin: { id: adminUser._id, email: adminUser.email, name: adminUser.name }
    });
  } catch (error) {
    console.error('Admin Firebase login error:', error);
    res.status(500).json({ message: error.message });
  }
});

// User Registration with Firebase
router.post('/register', [
  body('idToken').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { idToken } = req.body;
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;
    let user = await User.findOne({ firebaseUid: uid });
    if (!user) {
      user = new User({
        firebaseUid: uid,
        email,
        name: name || email.split('@')[0],
        profilePicture: picture || ''
      });
      await user.save();
    }
    res.status(201).json({
      message: 'User registered successfully',
      user: { id: user._id, email: user.email, name: user.name, profilePicture: user.profilePicture }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// User Login (Google Firebase)
router.post('/user/login', async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ message: 'No idToken provided' });
    }
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ message: 'Database connection error' });
    }
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;
    let user = await User.findOne({ firebaseUid: uid });
    if (!user && email) {
      user = await User.findOne({ email });
      if (user) {
        user.firebaseUid = uid;
      }
    }
    if (!user) {
      user = new User({
        firebaseUid: uid,
        email: email || `${uid}@placeholder.com`,
        name: name || (email ? email.split('@')[0] : 'New User'),
        profilePicture: picture || ''
      });
      try {
        await user.save();
      } catch (saveError) {
        if (saveError.code === 11000) {
          user = await User.findOne({ $or: [{ firebaseUid: uid }, { email }] });
        } else {
          throw saveError;
        }
      }
    } else {
      user.name = name || user.name;
      user.profilePicture = picture || user.profilePicture;
      if (email) user.email = email;
      try {
        await user.save();
      } catch (updateError) {
        console.error('Error updating user:', updateError.message);
      }
    }
    if (!user) {
      throw new Error('Failed to find or create user in MongoDB');
    }
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    res.cookie('user_token', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });
    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture
      },
      token
    });
  } catch (error) {
    console.error('Firebase/MongoDB login sync error:', error.message);
    res.status(401).json({
      message: 'Authentication failed',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get all users (admin only)
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find({});
    res.json({ count: users.length, users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('admin_token', { httpOnly: true, sameSite: isProd ? 'none' : 'lax', secure: isProd });
  res.clearCookie('user_token', { httpOnly: true, sameSite: 'lax', secure: isProd });
  res.json({ message: 'Logged out successfully' });
});

// Check Session
router.get('/me', async (req, res) => {
  try {
    const adminToken = getTokenFromRequest(req, 'admin_token');
    const userToken = getTokenFromRequest(req, 'user_token');
    if (!adminToken && !userToken) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    const decoded = jwt.verify(adminToken || userToken, process.env.JWT_SECRET);
    if (decoded.role === 'admin') {
      const admin = await Admin.findById(decoded.id).select('-password');
      if (!admin) return res.status(401).json({ message: 'Admin not found' });
      return res.json({ user: admin, role: 'admin' });
    } else {
      const user = await User.findById(decoded.userId);
      if (!user) return res.status(401).json({ message: 'User not found' });
      return res.json({
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          profilePicture: user.profilePicture,
          firebaseUid: user.firebaseUid
        },
        role: 'user'
      });
    }
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
});

module.exports = router;
