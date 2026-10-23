
require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Event = require('../models/Event');

const sampleEvents = [
  {
    title: 'AI & Deep Learning Global Summit 2026',
    shortDescription: 'Explore modern AI, machine learning and deep learning.',
    description: 'A technology event for students and developers to learn about artificial intelligence, machine learning and real-world applications.',
    category: 'technology',
    daysFromNow: 6,
    venue: {
      name: 'Convention Centre',
      address: 'Andheri East',
      city: 'Mumbai',
      state: 'Maharashtra',
      isOnline: false
    },
    price: 899,
    capacity: 200,
    featured: true,
    tags: ['AI', 'Machine Learning', 'Technology']
  },
  {
    title: 'Full-Stack Web Development Workshop',
    shortDescription: 'Learn frontend, backend and database fundamentals.',
    description: 'A practical workshop covering React, Node.js, Express and MongoDB for aspiring full-stack developers.',
    category: 'workshops',
    daysFromNow: 10,
    venue: {
      name: 'Innovation Hall',
      address: 'University Campus',
      city: 'Vijayawada',
      state: 'Andhra Pradesh',
      isOnline: false
    },
    price: 299,
    capacity: 100,
    featured: true,
    tags: ['React', 'Node.js', 'MongoDB']
  },
  {
    title: 'Acoustic Night: Live Music',
    shortDescription: 'Enjoy an evening of live acoustic performances.',
    description: 'A live music evening featuring acoustic performances and a welcoming atmosphere for music lovers.',
    category: 'music',
    daysFromNow: 14,
    venue: {
      name: 'Open Air Auditorium',
      address: 'City Centre',
      city: 'Hyderabad',
      state: 'Telangana',
      isOnline: false
    },
    price: 499,
    capacity: 150,
    featured: false,
    tags: ['Music', 'Live Performance', 'Acoustic']
  }
];

async function run() {
  try {
    await connectDB();

    let organizer = await User.findOne({ role: 'organizer' });

    if (!organizer) {
      organizer = await User.findOne({ role: 'admin' });
    }

    if (!organizer) {
      console.log(
        'No organizer or admin exists. Create an organizer account in EventX AI first.'
      );
      return;
    }

    let added = 0;
    let skipped = 0;

    for (const item of sampleEvents) {
      const existing = await Event.findOne({ title: item.title });

      if (existing) {
        console.log(`Skipped existing event: ${item.title}`);
        skipped++;
        continue;
      }

      const start = new Date();
      start.setDate(start.getDate() + item.daysFromNow);
      start.setHours(10, 0, 0, 0);

      const end = new Date(start);
      end.setHours(end.getHours() + 4);

      await Event.create({
        title: item.title,
        shortDescription: item.shortDescription,
        description: item.description,
        category: item.category,
        organizer: organizer._id,
        date: start,
        endDate: end,
        venue: item.venue,
        ticketTiers: [
          {
            name: 'General Admission',
            price: item.price,
            capacity: item.capacity,
            description: 'Standard event admission',
            perks: ['Event entry']
          }
        ],
        status: 'approved',
        isPublished: true,
        featured: item.featured,
        tags: item.tags
      });

      console.log(`Added event: ${item.title}`);
      added++;
    }

    console.log(`Finished. Added: ${added}; skipped: ${skipped}.`);
  } catch (error) {
    console.error('Safe seeding failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

run();
