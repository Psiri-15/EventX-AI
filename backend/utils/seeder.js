require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const crypto = require('crypto');
const connectDB = require('../config/db');

// Models
const User = require('../models/User');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const Ticket = require('../models/Ticket');
const Review = require('../models/Review');
const Notification = require('../models/Notification');
const { generateTicketQR } = require('../services/qrService');

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('[Seeder] Cleaning existing database records...');
    await Promise.all([
      User.deleteMany(),
      Event.deleteMany(),
      Booking.deleteMany(),
      Ticket.deleteMany(),
      Review.deleteMany(),
      Notification.deleteMany(),
    ]);

    console.log('[Seeder] Creating realistic test accounts...');

    // Users with plain passwords (pre('save') hook in User model securely hashes them)
    const users = await User.create([
      {
        name: 'EventX Platform Admin',
        email: 'admin@eventx.ai',
        password: 'Admin@123',
        role: 'admin',
        interests: ['technology', 'business'],
        organization: 'EventX AI Headquarters',
        phone: '+91 98765 43210',
        bio: 'Senior System Administrator oversee platform operations and event approvals.',
      },
      {
        name: 'Nexus Tech Summits',
        email: 'techcorp@eventx.ai',
        password: 'Organizer@123',
        role: 'organizer',
        interests: ['technology', 'workshops'],
        organization: 'Nexus Tech Global Ltd.',
        phone: '+91 98111 22334',
        bio: 'Premier technology conference and workshop organizer across Asia-Pacific.',
      },
      {
        name: 'Apex Campus Events',
        email: 'campusfest@eventx.ai',
        password: 'Organizer@123',
        role: 'organizer',
        interests: ['college', 'cultural', 'sports'],
        organization: 'Apex Engineering University',
        phone: '+91 98222 33445',
        bio: 'Student activities council and university event coordination committee.',
      },
      {
        name: 'SoundWave Live Entertainment',
        email: 'soundwave@eventx.ai',
        password: 'Organizer@123',
        role: 'organizer',
        interests: ['music', 'cultural'],
        organization: 'SoundWave Productions',
        phone: '+91 98333 44556',
        bio: 'Live acoustic, orchestral concerts and music festivals.',
      },
      {
        name: 'Alex Johnson',
        email: 'alex@eventx.ai',
        password: 'Attendee@123',
        role: 'attendee',
        interests: ['technology', 'workshops', 'business'],
        phone: '+91 99444 55667',
        bio: 'Passionate CSE student and aspiring Cloud Architect.',
      },
      {
        name: 'Priya Sharma',
        email: 'priya@eventx.ai',
        password: 'Attendee@123',
        role: 'attendee',
        interests: ['cultural', 'music', 'college'],
        phone: '+91 99555 66778',
        bio: 'Senior design student and indie music enthusiast.',
      },
    ]);

    const admin = users[0];
    const techOrganizer = users[1];
    const collegeOrganizer = users[2];
    const musicOrganizer = users[3];
    const attendeeAlex = users[4];
    const attendeePriya = users[5];

    console.log('[Seeder] Creating comprehensive event catalog...');

    const now = new Date();
    const futureDate = (days) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    const eventsData = [
      {
        title: 'AI & Deep Learning Global Summit 2026',
        shortDescription: 'Explore generative foundation models, neural architectures, and edge intelligence with world-class AI researchers.',
        description: 'Join over 1,500 AI researchers, software engineers, and founders for three days of deep technical breakthroughs. Keynote sessions explore multi-modal models, AI agent engineering, reasoning models, and production MLOps pipelines. Hands-on coding laboratories and recruiting pavilion included.',
        category: 'technology',
        organizer: techOrganizer._id,
        date: futureDate(12),
        endDate: futureDate(14),
        venue: {
          name: 'Bengaluru International Exhibition Centre (BIEC)',
          address: '10th Mile, Tumkur Road',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '562123',
          isOnline: false,
        },
        bannerImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
        ticketTiers: [
          { name: 'Student Pass', price: 799, capacity: 200, soldCount: 45, description: 'Access to keynotes and lab sessions with valid Student ID.' },
          { name: 'Standard Delegate', price: 1999, capacity: 500, soldCount: 120, description: 'All-access pass to all stages, technical tracks, and lunches.' },
          { name: 'VIP Executive', price: 4999, capacity: 80, soldCount: 30, description: 'VIP lounge, front-row keynote seating, and exclusive dinner with speakers.' },
        ],
        status: 'approved',
        isPublished: true,
        featured: true,
        tags: ['technology', 'ai', 'machine learning', 'deep learning', 'python'],
        cancellationPolicy: { allowed: true, cutoffHours: 24, refundPercentage: 100 },
      },
      {
        title: 'Full-Stack Web3 & Cloud Native Hackathon',
        shortDescription: 'A 36-hour sprint building decentralized applications, Kubernetes microservices, and AI toolchains.',
        description: 'Compete for ₹5,00,000 in bounties! Mentors from leading tech giants will assist teams in building scalable cloud native microservices, GraphQL APIs, and decentralized protocols. Free food, swag packs, and cloud compute credits for all participants.',
        category: 'technology',
        organizer: techOrganizer._id,
        date: futureDate(20),
        endDate: futureDate(22),
        venue: {
          name: 'T-Hub Innovation Campus',
          address: 'Knowledge City, Raidurg',
          city: 'Hyderabad',
          state: 'Telangana',
          postalCode: '500081',
          isOnline: false,
        },
        bannerImage: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1200&q=80',
        ticketTiers: [
          { name: 'Hacker Ticket', price: 0, capacity: 300, soldCount: 180, description: 'Free registration includes 36-hr hacking pass, meals, and swag.' },
          { name: 'Spectator & Demo Pass', price: 299, capacity: 150, soldCount: 40, description: 'Watch team presentations, networking sessions, and award ceremony.' },
        ],
        status: 'approved',
        isPublished: true,
        featured: true,
        tags: ['technology', 'hackathon', 'web3', 'cloud', 'coding'],
        cancellationPolicy: { allowed: true, cutoffHours: 48, refundPercentage: 100 },
      },
      {
        title: 'Apex Inter-Collegiate Cultural Fiesta 2026',
        shortDescription: 'The biggest university cultural festival featuring battle of the bands, choreography showcases, and celebrity performances.',
        description: 'Apex University welcomes colleges nationwide for the 15th annual Cultural Fiesta! Experience two unforgettable days of dramatic theatre, fashion runways, western & classical dance competitions, and live performances by top artists.',
        category: 'cultural',
        organizer: collegeOrganizer._id,
        date: futureDate(18),
        endDate: futureDate(19),
        venue: {
          name: 'Apex Open Air Amphitheatre',
          address: 'North University Enclave',
          city: 'Delhi',
          state: 'Delhi',
          postalCode: '110007',
          isOnline: false,
        },
        bannerImage: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
        ticketTiers: [
          { name: 'Day 1 Entry', price: 349, capacity: 800, soldCount: 220, description: 'Access to all cultural contests and exhibitions on Day 1.' },
          { name: 'All-Fest Pass', price: 599, capacity: 1200, soldCount: 450, description: 'Full 2-day pass including celebrity pronite entry.' },
          { name: 'VIP Fan Pit', price: 1299, capacity: 150, soldCount: 85, description: 'Stage-front barricade access for the evening music concert.' },
        ],
        status: 'approved',
        isPublished: true,
        featured: true,
        tags: ['cultural', 'college', 'dance', 'music', 'festival'],
        cancellationPolicy: { allowed: true, cutoffHours: 24, refundPercentage: 90 },
      },
      {
        title: 'Acoustic Night: Live Symphonic Fusion',
        shortDescription: 'An enchanting evening of acoustic string arrangements, contemporary jazz, and indie melodies.',
        description: 'Immerse yourself in mesmerizing acoustic harmonics performed by the National Chamber Orchestra alongside acclaimed indie vocalists. A tranquil, beautifully illuminated outdoor evening celebration of music and soulful compositions.',
        category: 'music',
        organizer: musicOrganizer._id,
        date: futureDate(8),
        endDate: futureDate(8),
        venue: {
          name: 'Royal Opera House',
          address: 'Mama Parmanand Marg, Charni Road',
          city: 'Mumbai',
          state: 'Maharashtra',
          postalCode: '400004',
          isOnline: false,
        },
        bannerImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
        ticketTiers: [
          { name: 'Balcony Seating', price: 899, capacity: 250, soldCount: 160, description: 'Elevated panoramic views of the auditorium orchestra.' },
          { name: 'Orchestra Stalls', price: 1499, capacity: 350, soldCount: 290, description: 'Premium ground floor seating close to acoustic arrays.' },
          { name: 'Royal Box', price: 2999, capacity: 40, soldCount: 38, description: 'Private seating box with welcome champagne/mocktail reception.' },
        ],
        status: 'approved',
        isPublished: true,
        featured: true,
        tags: ['music', 'acoustic', 'concert', 'orchestra', 'live'],
        cancellationPolicy: { allowed: true, cutoffHours: 48, refundPercentage: 100 },
      },
      {
        title: 'NextGen Robotics & Autonomous Systems Workshop',
        shortDescription: 'Hands-on hardware & ROS2 workshop on building LiDAR navigation and autonomous mobile robots.',
        description: 'Master autonomous robotics from the ground up! In this intensive two-day practical workshop, participants program ROS2 microcontrollers, calibrate ultrasonic and LiDAR sensors, and deploy SLAM (Simultaneous Localization and Mapping) algorithms on physical robotic rovers.',
        category: 'workshops',
        organizer: techOrganizer._id,
        date: futureDate(25),
        endDate: futureDate(26),
        venue: {
          name: 'CoEP Technological University Hall',
          address: 'Wellesley Road, Shivajinagar',
          city: 'Pune',
          state: 'Maharashtra',
          postalCode: '411005',
          isOnline: false,
        },
        bannerImage: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
        ticketTiers: [
          { name: 'Workshop Pass + Hardware Kit', price: 2499, capacity: 80, soldCount: 52, description: 'Includes physical rover chassis, sensor kit, and certificate.' },
          { name: 'Workshop Only (Bring Your Own Laptop)', price: 1199, capacity: 100, soldCount: 35, description: 'Full access to lab equipment and cloud simulation platforms.' },
        ],
        status: 'approved',
        isPublished: true,
        featured: false,
        tags: ['workshops', 'robotics', 'ros2', 'embedded', 'hardware'],
        cancellationPolicy: { allowed: true, cutoffHours: 24, refundPercentage: 100 },
      },
      {
        title: 'National Inter-University Esports & Sports Championship',
        shortDescription: 'Collegiate teams battle in Valorant, FIFA, Basketball, and Track events for championship honors.',
        description: 'Cheer on collegiate athletes and esports contenders as universities from all 28 states battle across traditional basketball courts and state-of-the-art gaming arenas. Features tournament finals, merchandise booths, and pro-gamer showmatches.',
        category: 'sports',
        organizer: collegeOrganizer._id,
        date: futureDate(30),
        endDate: futureDate(32),
        venue: {
          name: 'Jawaharlal Nehru Indoor Stadium',
          address: 'Raja Muthiah Road, Periamet',
          city: 'Chennai',
          state: 'Tamil Nadu',
          postalCode: '600003',
          isOnline: false,
        },
        bannerImage: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80',
        ticketTiers: [
          { name: 'General Spectator Pass', price: 199, capacity: 1500, soldCount: 320, description: 'Access to traditional sports courts and gaming arena seating.' },
          { name: 'Gaming Zone All-Access', price: 499, capacity: 300, soldCount: 110, description: 'Access to pro-gamer meet & greet and VR gaming booths.' },
        ],
        status: 'approved',
        isPublished: true,
        featured: false,
        tags: ['sports', 'esports', 'college', 'tournament', 'gaming'],
        cancellationPolicy: { allowed: true, cutoffHours: 24, refundPercentage: 100 },
      },
      {
        title: 'Founders & Angels Startup Pitch Arena 2026',
        shortDescription: 'Early-stage tech founders present live pitches to leading VC funds, angel syndicates, and accelerators.',
        description: 'Are you building the next generation of SaaS, AI, or Fintech? 20 curated seed-stage startups will pitch live to panels of top tier venture capital investors. Keynotes by unicorn founders and dedicated 1-on-1 investor matchmaking lounges.',
        category: 'business',
        organizer: techOrganizer._id,
        date: futureDate(15),
        endDate: futureDate(15),
        venue: {
          name: 'The Leela Palace Grand Ballroom',
          address: 'Old Airport Road, Kodihalli',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560008',
          isOnline: false,
        },
        bannerImage: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=80',
        ticketTiers: [
          { name: 'Founder Pass', price: 1499, capacity: 120, soldCount: 40, description: 'Includes pitch competition entry opportunity and founder kit.' },
          { name: 'General Investor & Attendee', price: 2499, capacity: 150, soldCount: 65, description: 'Access to all pitch showcases and investor cocktail networking.' },
        ],
        status: 'pending',
        isPublished: true,
        featured: false,
        tags: ['business', 'startups', 'venture capital', 'pitch', 'investors'],
        cancellationPolicy: { allowed: true, cutoffHours: 48, refundPercentage: 100 },
      },
      {
        title: 'Design Systems & UI/UX Masterclass',
        shortDescription: 'Level up your design workflow with Figma variables, tokens, accessible micro-interactions, and design tokens.',
        description: 'A comprehensive intensive workshop for product designers and frontend architects. Learn how industry leaders build scalable multi-brand design systems, organize Figma component architectures, and automate design-to-code pipelines.',
        category: 'workshops',
        organizer: techOrganizer._id,
        date: futureDate(5),
        endDate: futureDate(5),
        venue: {
          name: 'WeWork Enam Sambhav',
          address: 'BKC, Bandra Kurla Complex',
          city: 'Mumbai',
          state: 'Maharashtra',
          postalCode: '400051',
          isOnline: false,
        },
        bannerImage: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1200&q=80',
        ticketTiers: [
          { name: 'Standard Seat', price: 899, capacity: 60, soldCount: 48, description: 'Workshop materials, Figma library templates, and portfolio review.' },
        ],
        status: 'approved',
        isPublished: true,
        featured: false,
        tags: ['workshops', 'ui/ux', 'design', 'figma', 'frontend'],
        cancellationPolicy: { allowed: true, cutoffHours: 24, refundPercentage: 100 },
      },
    ];

    const createdEvents = await Event.create(eventsData);
    console.log(`[Seeder] Seeded ${createdEvents.length} events across categories.`);

    const aiSummitEvent = createdEvents[0];
    const acousticEvent = createdEvents[3];

    console.log('[Seeder] Creating realistic test bookings and digital QR tickets...');

    // Booking 1: Alex booked AI Summit
    const alexBookingRef = `EX-2026-AI89`;
    const alexBooking = await Booking.create({
      bookingReference: alexBookingRef,
      user: attendeeAlex._id,
      event: aiSummitEvent._id,
      tierItems: [
        {
          ticketTierId: aiSummitEvent.ticketTiers[0]._id,
          tierName: 'Student Pass',
          quantity: 2,
          unitPrice: 799,
          subtotal: 1598,
        },
      ],
      totalQuantity: 2,
      totalAmount: 1598,
      payment: {
        method: 'demo_card',
        status: 'completed',
        transactionId: 'DEMO_TXN_SEED_ALEX_101',
        paidAt: new Date(),
      },
      status: 'confirmed',
    });

    // Create 2 Tickets with QR codes for Alex
    for (let i = 1; i <= 2; i++) {
      const ticketCode = `TKT-ALEX-${aiSummitEvent._id.toString().substring(0, 4)}-00${i}`;
      const qrDataURL = await generateTicketQR({
        ticketCode,
        eventId: aiSummitEvent._id.toString(),
        bookingRef: alexBookingRef,
      });

      await Ticket.create({
        ticketCode,
        booking: alexBooking._id,
        event: aiSummitEvent._id,
        user: attendeeAlex._id,
        ticketTierName: 'Student Pass',
        price: 799,
        qrCodeData: qrDataURL,
        status: 'valid',
      });
    }

    // Booking 2: Priya booked Acoustic Night
    const priyaBookingRef = `EX-2026-MS42`;
    const priyaBooking = await Booking.create({
      bookingReference: priyaBookingRef,
      user: attendeePriya._id,
      event: acousticEvent._id,
      tierItems: [
        {
          ticketTierId: acousticEvent.ticketTiers[1]._id,
          tierName: 'Orchestra Stalls',
          quantity: 1,
          unitPrice: 1499,
          subtotal: 1499,
        },
      ],
      totalQuantity: 1,
      totalAmount: 1499,
      payment: {
        method: 'demo_upi',
        status: 'completed',
        transactionId: 'DEMO_TXN_SEED_PRIYA_202',
        paidAt: new Date(),
      },
      status: 'confirmed',
    });

    const priyaTicketCode = `TKT-PRIYA-${acousticEvent._id.toString().substring(0, 4)}-001`;
    const priyaQrDataURL = await generateTicketQR({
      ticketCode: priyaTicketCode,
      eventId: acousticEvent._id.toString(),
      bookingRef: priyaBookingRef,
    });

    await Ticket.create({
      ticketCode: priyaTicketCode,
      booking: priyaBooking._id,
      event: acousticEvent._id,
      user: attendeePriya._id,
      ticketTierName: 'Orchestra Stalls',
      price: 1499,
      qrCodeData: priyaQrDataURL,
      status: 'valid',
    });

    console.log('[Seeder] Adding authentic attendee reviews and notifications...');

    // Review on AI Summit
    await Review.create({
      user: attendeeAlex._id,
      event: aiSummitEvent._id,
      booking: alexBooking._id,
      rating: 5,
      title: 'Incredible speaker lineup and research tracks!',
      comment: 'Attended the previous edition and the level of technical depth in machine learning is unmatched. Highly recommend grabbing a Student Pass early!',
    });

    // Review on Acoustic Night
    await Review.create({
      user: attendeePriya._id,
      event: acousticEvent._id,
      booking: priyaBooking._id,
      rating: 5,
      title: 'Acoustics at the Royal Opera House are breathtaking',
      comment: 'The orchestral arrangements combined with indie vocals make this an unforgettable experience. Booking process was completely seamless.',
    });

    // In-app Notifications
    await Notification.create([
      {
        user: attendeeAlex._id,
        title: 'Booking Confirmed! 🎉',
        message: `Your booking for "${aiSummitEvent.title}" (2 tickets) is confirmed. Reference: ${alexBookingRef}`,
        type: 'booking_confirmation',
        link: '/my-tickets',
      },
      {
        user: attendeePriya._id,
        title: 'Booking Confirmed! 🎫',
        message: `Your booking for "${acousticEvent.title}" (1 ticket) is confirmed. Reference: ${priyaBookingRef}`,
        type: 'booking_confirmation',
        link: '/my-tickets',
      },
      {
        user: admin._id,
        title: 'New Event Pending Review',
        message: `Organizer "Nexus Tech Summits" submitted "Founders & Angels Startup Pitch Arena 2026" for approval.`,
        type: 'system',
        link: '/admin',
      },
    ]);

    console.log('------------------------------------------------------------');
    console.log('✅ EVENTX AI DATABASE SEEDED SUCCESSFULLY!');
    console.log('------------------------------------------------------------');
    console.log('Admin Account:     admin@eventx.ai     / Admin@123');
    console.log('Organizer Account: techcorp@eventx.ai  / Organizer@123');
    console.log('Attendee Account:  alex@eventx.ai      / Attendee@123');
    console.log('------------------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();
