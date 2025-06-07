// simpleCreateAdmin.js
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from '../models/user.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const createAdmin = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected:', mongoose.connection.host);

    // Admin user data
    const adminData = {
      userName: 'admin',
      email: 'admin@campuscodewars.com',
      password: 'admin123', // Change this to a secure password
      role: 'admin',
      profile: {
        name: 'Administrator',
        bio: 'System Administrator',
        avatarUrl: 'http://example.com/admin-avatar.jpg'
      },
      preferences: {
        programmingLanguage: 'JavaScript',
        theme: 'dark'
      }
    };

    // Check if admin already exists
    const existingAdmin = await User.findOne({ 
      $or: [
        { email: adminData.email },
        { userName: adminData.userName }
      ]
    });

    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Email:', existingAdmin.email);
      console.log('UserName:', existingAdmin.userName);
      return;
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(adminData.password, saltRounds);
    adminData.password = hashedPassword;

    // Create admin user
    const admin = new User(adminData);
    await admin.save();

    console.log('✅ Admin user created successfully!');
    console.log('Email:', admin.email);
    console.log('UserName:', admin.userName);
    console.log('Role:', admin.role);
    console.log('Profile Name:', admin.profile.name);

  } catch (error) {
    console.error('❌ Error creating admin:', error);
    
    // If it's a duplicate key error, provide specific guidance
    if (error.code === 11000) {
      console.log('\n🔧 This is a duplicate key error. Run the cleanup script first:');
      console.log('node scripts/simpleCleanup.js');
    }
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
};

createAdmin();