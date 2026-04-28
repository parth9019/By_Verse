require('dotenv').config({ path: '../.env' }); // 👈 IMPORTANT
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

async function createAdmin() {
  try {
    const email = 'patelarjun0147@gmail.com';
    const password = 'Admin@147';

    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      console.log('Admin already exists');
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name: 'Super Admin',
      email,
      password: hashedPassword,
      role: 'admin',
      isVerified: true
    });

    console.log('✅ Admin created successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Admin creation failed:', error);
    process.exit(1);
  }
}

createAdmin();
