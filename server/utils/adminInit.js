const User = require('../models/User');
const bcrypt = require('bcryptjs');

const initializeAdmin = async () => {
  try {
    // Check if admin user already exists
    const adminExists = await User.findOne({ role: 'admin' });

    if (!adminExists) {
      console.log('Creating admin user...');
      
      // Create admin user with valid email format
      await User.create({
        name: 'Administrator',
        email: `${process.env.ADMIN_USERNAME}@berserkarmory.com`,
        password: process.env.ADMIN_PASSWORD,
        role: 'admin'
      });
      
      console.log('Admin user created successfully');
    } else {
      console.log('Admin user already exists');
    }
  } catch (error) {
    console.error('Error initializing admin user:', error.message);
  }
};

module.exports = initializeAdmin; 