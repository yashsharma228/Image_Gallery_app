// resetDatabase.js
// This script deletes all documents from every collection in your MongoDB database.
// Usage: node resetDatabase.js

require('dotenv').config();
const mongoose = require('mongoose');

async function resetDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    const collections = await mongoose.connection.db.collections();
    for (const collection of collections) {
      const result = await collection.deleteMany({});
      console.log(`Cleared ${collection.collectionName}: ${result.deletedCount} documents deleted.`);
    }
    console.log('All collections cleared.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error clearing database:', err);
    process.exit(1);
  }
}

resetDatabase();
