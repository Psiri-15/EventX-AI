# EventX AI – Intelligent Event Management and Ticket Booking System
> **College Final-Year Computer Science & Engineering (CSE) Capstone Project**  
> Modern, Responsive, Production-Ready Full-Stack MERN Application

---

## 🚀 Project Overview

**EventX AI** is an intelligent, high-concurrency event management and digital ticketing platform designed for conferences, hackathons, cultural festivals, concerts, and workshops. It provides:

- **Atomic Inventory Control:** Concurrency-safe ticket reservation algorithms preventing overselling or race conditions.
- **Cryptographic Digital QR Passes:** Automated generation of unique tamper-evident QR tickets with real-time gate validation for event organizers.
- **Role-Based Authorization:** Secure endpoints with JWT and bcrypt password hashing enforcing permissions for **Attendees**, **Organizers**, and **Administrators**.
- **AI Recommendation Engine:** Weighted affinity scoring based on user interest vectors, booking history, and sales velocity.
- **EventX AI Assistant:** Dynamic chatbot providing real-time queries over live MongoDB event catalogs, venue logistics, prices, and cancellation policies (with optional Gemini/OpenAI API configuration and built-in contextual fallback).
- **Dual Payment Processing:** Zero-friction Demo Payment Mode for instant academic evaluations alongside test mode integration for Razorpay.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, JavaScript, React Router 7, Tailwind CSS, Lucide Icons, Recharts, Canvas Confetti |
| **Backend** | Node.js, Express.js (RESTful architecture), Helmet, CORS, Morgan, Express Rate Limit |
| **Database** | MongoDB with Mongoose ODM (Indexes, Schemas, Aggregations, Pre-save Hooks) |
| **Security & Auth** | JSON Web Tokens (JWT), bcryptjs password salting, Role-based Middleware |
| **Ticketing** | Node QRCode (High-density ECC Level H QR Matrix), Check-In validation scanner |
| **Payment Gateway** | Razorpay Test Mode + Built-in Simulated Demo Mode (Card & UPI) |
| **AI Capabilities** | Hybrid Rule-Based / Vector Scoring Engine + Configurable Gemini API integration |

---

## 👥 User Roles & Access Matrix

| Feature / Capability | Attendee | Organizer | Admin |
| :--- | :---: | :---: | :---: |
| Browse, Search & Filter Approved Events | ✅ | ✅ | ✅ |
| AI Recommendations & Interactive Chatbot | ✅ | ✅ | ✅ |
| Reserve Tickets with Atomic Concurrency | ✅ | ✅ | ✅ |
| Access Digital QR Tickets & Print Passes | ✅ | ❌ | ❌ |
| Booking History & Self-Service Cancellation | ✅ | ❌ | ❌ |
| Submit Verified Attendee Reviews | ✅ | ❌ | ❌ |
| In-App Notification Alerts Feed | ✅ | ✅ | ✅ |
| Create Events & Multi-Tier Pricing Schemes | ❌ | ✅ | ✅ |
| Organizer Sales & Revenue Analytics Charts | ❌ | ✅ | ✅ |
| QR Ticket Scanner & Gate Entry Validation | ❌ | ✅ | ✅ |
| Download Event Attendee Check-In Rosters | ❌ | ✅ | ✅ |
| Platform-Wide Revenue & User Governance | ❌ | ❌ | ✅ |
| Event Moderation (Approve / Reject / Feature) | ❌ | ❌ | ✅ |

---

## 📁 Project Directory Structure

```text
EventX-AI/
├── package.json                   # Cross-directory npm runner
├── README.md                      # Comprehensive documentation
├── backend/
│   ├── config/
│   │   └── db.js                  # MongoDB Mongoose connection
│   ├── controllers/
│   │   ├── adminController.js     # Moderation & system oversight
│   │   ├── aiController.js        # AI chatbot & recommendations
│   │   ├── authController.js      # Register, login, profile
│   │   ├── bookingController.js   # Atomic reservations & cancellations
│   │   ├── eventController.js     # Public discovery & CRUD
│   │   ├── notificationController.js # In-app notification feed
│   │   ├── organizerController.js # Host statistics & attendees
│   │   ├── reviewController.js    # Verified attendee reviews
│   │   └── ticketController.js    # Digital passes & QR gate validation
│   ├── middleware/
│   │   ├── auth.js                # JWT verification & role authorization
│   │   ├── errorHandler.js        # Centralized JSON error format
│   │   └── rateLimiter.js         # API & brute-force defense
│   ├── models/
│   │   ├── Booking.js             # Orders, tier items, refund status
│   │   ├── Event.js               # Event metadata, tiers, rating cache
│   │   ├── Notification.js        # Alerts
│   │   ├── Review.js              # 1-5 star verified reviews
│   │   ├── Ticket.js              # QR matrix & check-in audit
│   │   └── User.js                # Attendee, Organizer, Admin accounts
│   ├── routes/                    # Express modular route definitions
│   ├── services/
│   │   ├── aiService.js           # Live context AI & demand analyzer
│   │   ├── paymentService.js      # Razorpay & Demo gateway handler
│   │   ├── qrService.js           # QR code matrix renderer
│   │   └── recommendationService.js # Affinity scoring algorithm
│   ├── tests/
│   │   └── api.test.js            # Automated integration test suite
│   ├── utils/
│   │   └── seeder.js              # Comprehensive database seeder
│   ├── .env.example
│   ├── .env
│   ├── package.json
│   └── server.js                  # Entry server daemon
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── AIChatWidget.jsx   # Floating AI assistant drawer
    │   │   ├── EventCard.jsx      # Event listing component
    │   │   ├── Footer.jsx         # Academic & architectural footer
    │   │   ├── Navbar.jsx         # Responsive navigation & notifications
    │   │   └── ProtectedRoute.jsx # Role route security barrier
    │   ├── context/
    │   │   └── AuthContext.jsx    # Session state & JWT persistence
    │   ├── pages/
    │   │   ├── AdminDashboardPage.jsx      # Moderation & platform overview
    │   │   ├── CheckoutPage.jsx            # Order confirmation & payments
    │   │   ├── CreateEventPage.jsx         # Tier builder & event publisher
    │   │   ├── EventDetailPage.jsx         # Schedule, tickets, reviews
    │   │   ├── EventsPage.jsx              # Discovery, filters & sorting
    │   │   ├── HomePage.jsx                # Landing & AI showcases
    │   │   ├── LoginPage.jsx               # Quick demo credentials login
    │   │   ├── MyBookingsPage.jsx          # History & policy cancellations
    │   │   ├── MyTicketsPage.jsx           # Digital QR passes
    │   │   ├── OrganizerDashboardPage.jsx  # Sales charts & QR scanner
    │   │   ├── ProfilePage.jsx             # Interests & account details
    │   │   └── RegisterPage.jsx            # Account creation
    │   ├── services/
    │   │   └── api.js             # Axios client with JWT interceptor
    │   ├── App.jsx                # Client router setup
    │   ├── index.css              # Tailwind CSS directives
    │   └── main.jsx
    ├── index.html
    ├── tailwind.config.js
    └── vite.config.js
```

---

## ⚡ Quick Start & Setup Guide

### 1. Prerequisites
- **Node.js** (v18.0 or higher recommended, tested on Node v24)
- **MongoDB** running locally on default port `27017` (e.g., `mongodb://127.0.0.1:27017/eventx_ai`) or a MongoDB Atlas URI.

### 2. Configure Environment Variables
Inside `EventX-AI/backend/`, a `.env` file is pre-configured for local execution:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/eventx_ai
JWT_SECRET=eventx_super_secret_jwt_key_2026_cse_project
JWT_EXPIRES_IN=30d

# Payment Gateway (Leave empty to use built-in Zero-Friction Demo Mode)
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

# Optional AI Provider (Leave empty to use built-in Live MongoDB Contextual AI)
GEMINI_API_KEY=
```

### 3. Seed Database with Initial Dataset
Run the seeder from the `EventX-AI` directory (or inside `backend/`):

```bash
cd backend
npm run seed
```

This seeds:
- 3 Pre-configured User Accounts (Admin, Organizer, Attendee)
- 8 Realistic Events across Technology, Workshops, Music, Cultural, Sports, and Business
- Pre-booked orders, generated digital QR tickets, verified reviews, and notifications.

### 4. Evaluation Credentials

| Role | Email | Password | Pre-configured Access |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@eventx.ai` | `Admin@123` | Full access to Admin Center, Event Approvals, User Governance |
| **Organizer** | `techcorp@eventx.ai` | `Organizer@123` | Host Portal, Sales Charts, Event Publisher, QR Ticket Scanner |
| **Attendee** | `alex@eventx.ai` | `Attendee@123` | Discovery, Checkout, Digital QR Passes, Cancellations, Reviews |

*(Tip: The login page includes 1-click **Evaluation Demo Buttons** for instant evaluation).*

### 5. Running the Application

In a terminal, start the **Backend Server**:
```bash
cd backend
npm start
# Server listens on http://localhost:5000
```

In a second terminal, start the **Frontend Client**:
```bash
cd frontend
npm run dev
# Frontend launches on http://localhost:5173
```

Open your browser at `http://localhost:5173`.

---

## 🧪 Automated Integration Tests

EventX AI includes an automated test suite verifying all 11 core endpoints and authorization checks:

```bash
cd backend
npm test
```

**Test Coverage Summary:**
- ✔ Health check endpoint responds online
- ✔ Attendee authentication & profile issuance
- ✔ Organizer authentication
- ✔ Admin authentication
- ✔ Public event discovery & category filtering
- ✔ Role authorization (Attendee blocked from Admin endpoints: 403 Forbidden)
- ✔ Role authorization (Admin authorized for platform stats)
- ✔ Attendee digital tickets with cryptographic codes
- ✔ Organizer ticket validation & entry check
- ✔ AI Chatbot contextual responses with live database records
- ✔ AI Personalized event recommendations & affinity scoring

---

## 📡 REST API Documentation

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Create new Attendee or Organizer account.
- `POST /api/auth/login` - Authenticate credentials and receive signed JWT.
- `GET /api/auth/me` - Retrieve current session profile.
- `PUT /api/auth/profile` - Update profile, bio, and AI recommendation interests.

### Events (`/api/events`)
- `GET /api/events` - Query events with search, category, city, date, and price filters.
- `GET /api/events/featured` - Retrieve featured editorial events.
- `GET /api/events/:id` - Fetch comprehensive event details with ticket tiers and venue.
- `POST /api/events` - *[Organizer/Admin]* Publish or submit an event for review.
- `PUT /api/events/:id` - *[Organizer/Admin]* Update event details.
- `DELETE /api/events/:id` - *[Organizer/Admin]* Delete an event.

### Bookings (`/api/bookings`)
- `POST /api/bookings/checkout` - Verify server-side pricing and reserve lock.
- `POST /api/bookings` - Finalize booking with atomic inventory decrement.
- `GET /api/bookings/my-bookings` - Fetch attendee booking history.
- `GET /api/bookings/:id` - Fetch single booking invoice.
- `PUT /api/bookings/:id/cancel` - Cancel booking and compute refund according to cutoff policy.

### Digital QR Tickets (`/api/tickets`)
- `GET /api/tickets/my-tickets` - List attendee digital tickets with QR matrices.
- `GET /api/tickets/code/:code` - Inspect ticket verification status.
- `POST /api/tickets/validate` - *[Organizer/Admin]* Validate ticket code or scanned QR payload.
- `POST /api/tickets/check-in` - *[Organizer/Admin]* Confirm check-in at gate and record audit trail.

### Reviews & Notifications (`/api/reviews`, `/api/notifications`)
- `GET /api/reviews/event/:eventId` - Retrieve public attendee reviews for an event.
- `POST /api/reviews` - *[Attendee]* Submit verified review (requires confirmed booking).
- `GET /api/notifications` - Retrieve in-app notification feed and unread count.
- `PUT /api/notifications/:id/read` - Mark single notification as read.
- `PUT /api/notifications/read-all` - Mark all notifications as read.

### Organizer & Admin Portals (`/api/organizer`, `/api/admin`)
- `GET /api/organizer/stats` - Fetch organizer ticket sales and revenue timeline.
- `GET /api/organizer/events` - List events hosted by organizer.
- `GET /api/organizer/events/:id/attendees` - List attendee check-in roster.
- `GET /api/admin/stats` - Fetch platform-wide metrics & category distributions.
- `GET /api/admin/events` - View all events across approval statuses.
- `PUT /api/admin/events/:id/status` - Approve, reject (with reason), or feature events.
- `GET /api/admin/users` - Platform user directory.
- `PUT /api/admin/users/:id` - Toggle active/deactivated status or update roles.
- `GET /api/admin/bookings` - View all platform-wide transactions.

### AI Capabilities (`/api/ai`)
- `POST /api/ai/chat` - Interactive assistant answering event queries with real-time context.
- `GET /api/ai/recommendations` - Vector-scored personalized recommendations.
- `GET /api/ai/demand-insights/:eventId` - Ticket sales velocity and capacity fill-rate metrics.

---

## 🎓 Academic Presentation / Viva Highlights

When presenting this project:
1. **Concurrency Handling:** Explain how `findOneAndUpdate` with atomic `$inc` and conditional queries (`soldCount <= capacity - qty`) prevents double-booking without requiring distributed locks.
2. **Cryptographic Digital QR Passes:** Show how QR matrices encode compact verification payloads that are securely checked against the backend database rather than trusting client-tampered strings.
3. **Role Architecture:** Demonstrate how attempts by attendees to access `/api/admin/stats` fail with HTTP 403 Forbidden.
4. **Contextual AI Chatbot:** Demonstrate the chatbot asking for tech events or ticket policies, showing how live MongoDB events are incorporated into responses.
5. **Evaluation Usability:** Highlight the one-click demo credentials on the login screen and the demo payment gateway allowing immediate, frictionless end-to-end testing.
