// simpleCleanup.js
import mongoose from 'mongoose';
import User from '../models/user.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const cleanupDatabase = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    // Remove users with missing or invalid userName
    const result = await User.deleteMany({ 
      $or: [
        { userName: null },
        { userName: { $exists: false } },
        { userName: '' }
      ]
    });

    console.log(`✅ Removed ${result.deletedCount} invalid user records`);

    // Show remaining users
    const users = await User.find({}, { email: 1, userName: 1, role: 1 });
    console.log('Remaining users:', users);

    // Check total user count
    const userCount = await User.countDocuments();
    console.log(`Total users in database: ${userCount}`);

  } catch (error) {
    console.error('❌ Error cleaning database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
};

cleanupDatabase();