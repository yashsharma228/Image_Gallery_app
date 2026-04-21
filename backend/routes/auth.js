const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');
const firebaseAdmin = require('../firebaseAdmin');
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

// User Registration with Firebase Gmail
router.post('/register', [
  body('idToken').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { idToken } = req.body;
    // Verify Firebase token
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;

    // Check if user already exists in MongoDB
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
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


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

// Admin Firebase Login (Google Firebase)
router.post('/admin/firebase-login', async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ message: 'No idToken provided' });

    // Verify Firebase token
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
    const { uid, email, name } = decodedToken;

    // Check if user is an Admin in MongoDB
    let adminUser = await Admin.findOne({ 
      $or: [{ firebaseUid: uid }, { email: email.toLowerCase() }] 
    });

    if (!adminUser) {
      // Option 1: Create a new admin automatically (Not recommended for production)
      // Option 2: Reject if not already registered as Admin
      return res.status(403).json({ message: 'User is not registered as an Admin' });
    }

    // Link Firebase UID if not already linked
    if (!adminUser.firebaseUid) {
      adminUser.firebaseUid = uid;
      await adminUser.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: adminUser._id, email: adminUser.email, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set token in HTTP-only cookie
    res.cookie("admin_token", token, cookieOpts7d);

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
    console.error('Admin Firebase login error:', error);
    res.status(500).json({ message: error.message });
  }
});

// User Login (Google Firebase)
router.post('/user/login', async (req, res) => {
  try {
    console.log('📥 User login request received at /api/auth/user/login');
    const { idToken } = req.body;

    if (!idToken) {
      console.log('❌ Error: No idToken provided in request body');
      return res.status(400).json({ message: 'No idToken provided' });
    }

    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      console.error('❌ MongoDB not connected! ReadyState:', mongoose.connection.readyState);
      return res.status(500).json({ message: 'Database connection error' });
    }

    // Verify Firebase token
    console.log('🔍 Verifying Firebase idToken...');
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;
    console.log(`✅ Firebase token verified for user: ${email} (UID: ${uid})`);

    // Find or create user in MongoDB
    let user = await User.findOne({ firebaseUid: uid });
    
    if (!user && email) {
      console.log(`🔍 User not found by UID, searching by email: ${email}...`);
      user = await User.findOne({ email });
      if (user) {
        console.log('✅ User found by email, linking Firebase UID...');
        user.firebaseUid = uid;
      }
    }

    if (!user) {
      console.log('📝 Creating new user in MongoDB...');
      user = new User({
        firebaseUid: uid,
        email: email || `${uid}@placeholder.com`, // Ensure email is never empty for uniqueness
        name: name || (email ? email.split('@')[0] : 'New User'),
        profilePicture: picture || ''
      });
      
      try {
        await user.save();
        console.log('✅ New user saved to MongoDB successfully!');
      } catch (saveError) {
        console.error('❌ Error saving new user to MongoDB:', saveError.message);
        // Handle duplicate key error if another user was created in the meantime
        if (saveError.code === 11000) {
          console.log('🔄 Duplicate key error, re-fetching user...');
          user = await User.findOne({ $or: [{ firebaseUid: uid }, { email }] });
        } else {
          throw saveError;
        }
      }
    } else {
      // Update existing user info if needed
      console.log('🔄 Updating existing user info in MongoDB...');
      user.name = name || user.name;
      user.profilePicture = picture || user.profilePicture;
      if (email) user.email = email;
      
      try {
        await user.save();
        console.log('✅ User updated in MongoDB successfully!');
      } catch (updateError) {
        console.error('❌ Error updating user in MongoDB:', updateError.message);
      }
    }

    if (!user) {
      throw new Error('Failed to find or create user in MongoDB');
    }

    // Issues JWT token for API calls
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Set cookie for browser sessions
    res.cookie('user_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    console.log(`🚀 Login process complete for user ${user.email}. Sending response...`);
    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        _id: user._id, // Provide both for compatibility
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture
      },
      token
    });

  } catch (error) {
    console.error('❌ Firebase/MongoDB login sync error:', error.message);
    res.status(401).json({ 
      message: 'Authentication failed', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Production-safe endpoint to get all users (admin only)
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find({});
    res.json({ count: users.length, users });
  } catch (error) {
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

// Admin Firebase Login (Google Firebase)
router.post('/admin/firebase-login', async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ message: 'No idToken provided' });

    // Verify Firebase token
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
    const { uid, email, name } = decodedToken;

    // Check if user is an Admin in MongoDB
    let adminUser = await Admin.findOne({ 
      $or: [{ firebaseUid: uid }, { email: email.toLowerCase() }] 
    });

    if (!adminUser) {
      // Option 1: Create a new admin automatically (Not recommended for production)
      // Option 2: Reject if not already registered as Admin
      return res.status(403).json({ message: 'User is not registered as an Admin' });
    }

    // Link Firebase UID if not already linked
    if (!adminUser.firebaseUid) {
      adminUser.firebaseUid = uid;
      await adminUser.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: adminUser._id, email: adminUser.email, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Set token in HTTP-only cookie
    res.cookie("admin_token", token, cookieOpts7d);

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
    console.error('Admin Firebase login error:', error);
    res.status(500).json({ message: error.message });
  }
});

// User Login (Google Firebase)
router.post('/user/login', async (req, res) => {
  try {
    console.log('📥 User login request received at /api/auth/user/login');
    const { idToken } = req.body;

    if (!idToken) {
      console.log('❌ Error: No idToken provided in request body');
      return res.status(400).json({ message: 'No idToken provided' });
    }

    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      console.error('❌ MongoDB not connected! ReadyState:', mongoose.connection.readyState);
      return res.status(500).json({ message: 'Database connection error' });
    }

    // Verify Firebase token
    console.log('🔍 Verifying Firebase idToken...');
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;
    console.log(`✅ Firebase token verified for user: ${email} (UID: ${uid})`);

    // Find or create user in MongoDB
    let user = await User.findOne({ firebaseUid: uid });
    
    if (!user && email) {
      console.log(`🔍 User not found by UID, searching by email: ${email}...`);
      user = await User.findOne({ email });
      if (user) {
        console.log('✅ User found by email, linking Firebase UID...');
        user.firebaseUid = uid;
      }
    }

    if (!user) {
      console.log('📝 Creating new user in MongoDB...');
      user = new User({
        firebaseUid: uid,
        email: email || `${uid}@placeholder.com`, // Ensure email is never empty for uniqueness
        name: name || (email ? email.split('@')[0] : 'New User'),
        profilePicture: picture || ''
      });
      
      try {
        await user.save();
        console.log('✅ New user saved to MongoDB successfully!');
      } catch (saveError) {
        console.error('❌ Error saving new user to MongoDB:', saveError.message);
        // Handle duplicate key error if another user was created in the meantime
        if (saveError.code === 11000) {
          console.log('🔄 Duplicate key error, re-fetching user...');
          user = await User.findOne({ $or: [{ firebaseUid: uid }, { email }] });
        } else {
          throw saveError;
        }
      }
    } else {
      // Update existing user info if needed
      console.log('🔄 Updating existing user info in MongoDB...');
      user.name = name || user.name;
      user.profilePicture = picture || user.profilePicture;
      if (email) user.email = email;
      
      try {
        await user.save();
        console.log('✅ User updated in MongoDB successfully!');
      } catch (updateError) {
        console.error('❌ Error updating user in MongoDB:', updateError.message);
      }
    }

    if (!user) {
      throw new Error('Failed to find or create user in MongoDB');
    }

    // Issues JWT token for API calls
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Set cookie for browser sessions
    res.cookie('user_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    console.log(`🚀 Login process complete for user ${user.email}. Sending response...`);
    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        _id: user._id, // Provide both for compatibility
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture
      },
      token
    });

  } catch (error) {
    console.error('❌ Firebase/MongoDB login sync error:', error.message);
    res.status(401).json({ 
      message: 'Authentication failed', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});


// Production-safe endpoint to get all users (admin only)
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find({});
    res.json({ count: users.length, users });
  } catch (error) {
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
