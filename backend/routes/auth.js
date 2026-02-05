const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');
const firebaseAdmin = require('../firebaseAdmin'); // Use the already initialized Firebase Admin
const Admin = require('../models/Admin');
const User = require('../models/User');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();
const isProd = process.env.NODE_ENV === 'production';
const cookieOpts7d = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000
};
const cookieOpts30d = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'none' : 'lax',
  maxAge: 30 * 24 * 60 * 60 * 1000
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
    
    // Find admin by email
    const adminUser = await Admin.findOne({ email });
    if (!adminUser) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Compare passwords using bcrypt
    const isPasswordValid = await adminUser.matchPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: adminUser._id, email: adminUser.email, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Set token in HTTP-only cookie
    res.cookie("admin_token", token, cookieOpts7d);

    // Return token in response for frontend storage
    res.json({
      success: true,
      token,
      admin: {
        id: adminUser._id,
        email: adminUser.email,
        name: adminUser.name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Admin Register (for initial setup - should be protected in production)
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
    
    // Check if admin already exists
    let adminUser = await Admin.findOne({ email });
    if (adminUser) {
      return res.status(400).json({ message: 'Admin with this email already exists' });
    }
    
    // Create new admin (password will be hashed by pre-save middleware)
    adminUser = new Admin({ email, password, name });
    await adminUser.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { id: adminUser._id, email: adminUser.email, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Set token in HTTP-only cookie
    res.cookie("admin_token", token, cookieOpts7d);

    res.status(201).json({
      success: true,
      message: 'Admin registered successfully',
      admin: {
        id: adminUser._id,
        email: adminUser.email,
        name: adminUser.name
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: error.message });
  }
});

// User Login (Google Firebase)
router.post('/user/login', async (req, res) => {
  try {
    console.log('📥 User login request received');
    const { idToken } = req.body;
    
    if (!idToken) {
      console.error('❌ No ID token provided');
      return res.status(400).json({ message: 'ID token required' });
    }
    
    console.log('🔐 Verifying Firebase ID token...');
    // Verify Firebase ID token
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;
    
    console.log('✅ Firebase user authenticated:', { uid, email, name, picture });
    
    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      console.error('❌ MongoDB not connected!');
      return res.status(500).json({ message: 'Database connection error' });
    }
    
    console.log('💾 Checking MongoDB for existing user...');
    // Create or update user in MongoDB
    // First, try to find user by firebaseUid
    let user = await User.findOne({ firebaseUid: uid });
    
    // If not found by firebaseUid, try to find by email (to handle pre-existing users or duplicate emails)
    if (!user && email) {
      console.log('🔍 Checking by email since firebaseUid not found...');
      user = await User.findOne({ email });
      if (user) {
        console.log('✅ Found existing user by email. Updating firebaseUid...');
        user.firebaseUid = uid;
      }
    }

    if (!user) {
      console.log('📝 Creating new user in MongoDB...');
      user = new User({
        firebaseUid: uid,
        email: email || '',
        name: name || (email ? email.split('@')[0] : 'User'),
        profilePicture: picture || ''
      });
      
      try {
        await user.save();
        console.log('✅ New user saved to MongoDB successfully!');
      } catch (saveError) {
        // Handle duplicate key error explicitly
        if (saveError.code === 11000) {
           console.log('⚠️ Duplicate key error caught. Retrying fetch...');
           // One last check if race condition created user in parallel
           user = await User.findOne({ $or: [{ firebaseUid: uid }, { email: email }] });
           if (!user) {
             console.error('❌ Duplicate key error but user not found:', saveError);
             throw saveError;
           }
           console.log('✅ Recovered from duplicate key error. User found.');
           // Proceed to update logic below
        } else {
           console.error('❌ Error saving user to MongoDB:', saveError);
           throw saveError;
        }
      }
    } 
    
    // If user exists (found or recovered), update their info
    if (user) {
      console.log('🔄 Updating existing user in MongoDB...');
      user.firebaseUid = uid; // Ensure firebaseUid is set (important if found by email)
      user.email = email || user.email;
      user.name = name || user.name || (email ? email.split('@')[0] : 'User');
      user.profilePicture = picture || user.profilePicture || '';
      
      try {
        await user.save();
        console.log('✅ User updated in MongoDB successfully!');
      } catch (saveError) {
        console.error('❌ Error updating user in MongoDB:', saveError);
        throw saveError;
      }
    }
    
    // Issue JWT token for API calls
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    // Set token in HTTP-only cookie
    res.cookie("user_token", token, cookieOpts30d);

    console.log('🎉 Login successful! User:', {
      id: user._id,
      email: user.email,
      name: user.name
    });
    
    res.json({
      token, // <-- return JWT token for frontend
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        profilePicture: user.profilePicture,
        firebaseUid: user.firebaseUid
      }
    });
  } catch (error) {
    console.error('❌ Firebase verification error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
    res.status(401).json({ message: 'Invalid token or authentication failed', error: error.message });
  }
});

// Test endpoint to get all users (for debugging)
router.get('/user/test', async (req, res) => {
  try {
    const users = await User.find({});
    console.log('📊 Total users in MongoDB:', users.length);
    res.json({ count: users.length, users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: error.message });
  }
});

// Logout (Clear Cookie)
router.post('/logout', (req, res) => {
  res.clearCookie('admin_token', { ...cookieOpts7d, maxAge: undefined });
  res.clearCookie('user_token', { ...cookieOpts7d, maxAge: undefined });
  res.json({ message: 'Logged out successfully' });
});

// Check Session (Me)
router.get('/me', async (req, res) => {
  try {
    const adminToken = req.cookies.admin_token;
    const userToken = req.cookies.user_token;
    if (!adminToken && !userToken) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const decoded = jwt.verify(adminToken || userToken, process.env.JWT_SECRET);
    
    // Check if it's an admin
    if (decoded.role === 'admin') {
       const admin = await Admin.findById(decoded.id).select('-password');
       if (!admin) return res.status(401).json({ message: 'Admin not found' });
       return res.json({ user: admin, role: 'admin' });
    } else {
       // Assume regular user
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
