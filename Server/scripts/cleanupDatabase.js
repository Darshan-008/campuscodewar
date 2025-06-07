// comprehensiveCleanup.js
import mongoose from 'mongoose';
import User from '../models/user.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const comprehensiveCleanup = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    // First, let's see what indexes exist
    console.log('\n📋 Current indexes on users collection:');
    const indexes = await User.collection.getIndexes();
    console.log(indexes);

    // Check current users in database
    console.log('\n👥 Current users in database:');
    const allUsers = await User.find({}).lean();
    console.log('Total users:', allUsers.length);
    allUsers.forEach((user, index) => {
      console.log(`User ${index + 1}:`, {
        _id: user._id,
        userName: user.userName,
        username: user.username, // This might not exist in your schema
        email: user.email,
        role: user.role
      });
    });

    // Remove users with problematic data
    console.log('\n🧹 Cleaning up problematic records...');
    
    // Delete users with missing required fields
    const deleteResult = await User.deleteMany({
      $or: [
        { userName: null },
        { userName: { $exists: false } },
        { userName: '' },
        { email: null },
        { email: { $exists: false } },
        { email: '' }
      ]
    });

    console.log(`✅ Deleted ${deleteResult.deletedCount} invalid users`);

    // If there's still a username index causing issues, we might need to drop it
    console.log('\n🔧 Checking for problematic username index...');
    try {
      // Try to drop the username index if it exists
      await User.collection.dropIndex('username_1');
      console.log('✅ Dropped old username_1 index');
    } catch (error) {
      if (error.code === 27) {
        console.log('ℹ️  username_1 index does not exist (this is good)');
      } else {
        console.log('⚠️  Could not drop username index:', error.message);
      }
    }

    // Show final state
    console.log('\n📊 Final database state:');
    const finalUsers = await User.find({}, { email: 1, userName: 1, role: 1 });
    console.log('Remaining users:', finalUsers);
    console.log(`Total users: ${finalUsers.length}`);

    // Check if we can create the admin now
    console.log('\n🔍 Checking if admin can be created...');
    const adminExists = await User.findOne({
      $or: [
        { email: 'admin@campuscodewars.com' },
        { userName: 'admin' }
      ]
    });

    if (adminExists) {
      console.log('⚠️  Admin user already exists:', {
        email: adminExists.email,
        userName: adminExists.userName,
        role: adminExists.role
      });
    } else {
      console.log('✅ Admin user can be created');
    }

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed.');
  }
};

comprehensiveCleanup();