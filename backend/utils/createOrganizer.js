
require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');

async function createOrganizer() {
  try {
    await connectDB();

    const email = 'organizer@eventx.ai';

    const existing = await User.findOne({ email });

    if (existing) {
      console.log(`Account already exists with role: ${existing.role}`);
      return;
    }

    const organizer = await User.create({
      name: 'EventX Organizer',
      email,
      password: require('crypto').randomBytes(24).toString('hex'),
      role: 'organizer',
      organization: 'EventX AI',
      interests: ['technology', 'workshops']
    });

    console.log('Organizer account created successfully.');
    console.log(`Account ID: ${organizer._id}`);
    console.log(`Email: ${organizer.email}`);
    console.log('A random password was generated. Set a secure login password through a proper password-reset flow before using this account to sign in.');
  } catch (error) {
    console.error('Organizer setup failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

createOrganizer();
