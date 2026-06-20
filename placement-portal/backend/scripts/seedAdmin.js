require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const connectDB = require('../config/db');

const seedAdmin = async () => {
  try {
    console.log('Connecting to database to seed admin user...');
    await connectDB();

    const username = 'admin';
    const existingAdmin = await Admin.findOne({ username });

    if (existingAdmin) {
      console.log(`Admin user with username "${username}" already exists.`);
    } else {
      console.log(`Admin user with username "${username}" not found. Creating...`);
      
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const newAdmin = new Admin({
        username,
        password: hashedPassword
      });

      await newAdmin.save();
      console.log('Admin user seeded successfully. Username: "admin", Password: "admin123"');
    }
  } catch (error) {
    console.error('Error seeding admin user:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
    process.exit(0);
  }
};

seedAdmin();
