const mongoose = require('mongoose');
require('dotenv').config();
const Admin = require('./models/Admin');
const bcrypt = require('bcryptjs');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/image-gallery', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(async () => {
  console.log('Connected to MongoDB');
  
  // Create a test admin with known password
  const testEmail = 'admin@test.com';
  const testPassword = 'admin123';
  
  // Delete existing test admin if exists
  await Admin.deleteOne({ email: testEmail });
  
  // Create new admin
  const admin = new Admin({
    email: testEmail,
    password: testPassword,
    name: 'Test Admin'
  });
  
  await admin.save();
  console.log(`Test admin created: ${testEmail} / ${testPassword}`);
  
  // Test password comparison
  const testAdmin = await Admin.findOne({ email: testEmail });
  const isMatch = await testAdmin.matchPassword(testPassword);
  console.log(`Password match test: ${isMatch}`);
  
  process.exit(0);
}).catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});
