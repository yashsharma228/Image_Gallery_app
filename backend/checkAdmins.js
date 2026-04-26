const mongoose = require('mongoose');
require('dotenv').config();
const Admin = require('./models/Admin');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/image-gallery', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(async () => {
  console.log('Connected to MongoDB');
  const admins = await Admin.find({});
  console.log('Existing admins:', admins.length);
  if (admins.length > 0) {
    admins.forEach(admin => {
      console.log(`- Email: ${admin.email}, Name: ${admin.name}, Has Firebase: ${!!admin.firebaseUid}`);
    });
  } else {
    console.log('No admin users found. You need to create an admin user first.');
  }
  process.exit(0);
}).catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});
