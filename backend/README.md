# FHSU GamePulse - Backend API

A production-ready backend service powering the FHSU GamePulse mobile application, designed to revolutionize event engagement at Fort Hays State University through real-time synchronization and comprehensive event management.

## Overview

FHSU GamePulse Backend provides the server infrastructure for managing campus events, tracking real-time attendance, and orchestrating synchronized crowd experiences during live events. The system leverages WebSocket technology to enable thousands of attendees to participate in coordinated flash displays, creating an electrifying unified atmosphere during sporting events, commencement ceremonies, and community gatherings.

### Key Capabilities

**Event Management System**
- Comprehensive CRUD operations for campus events across multiple categories (sports, commencement, community)
- Facility association with venue capacity tracking
- Live event status controls with real-time updates
- QR code generation for streamlined check-ins

**Real-Time Attendance Tracking**
- Instant check-in/check-out processing with sub-second latency
- Live attendee count broadcasts via WebSocket
- Session-based tracking for flash synchronization
- Device information logging for analytics

**Synchronized Flash System**
- WebSocket-based real-time broadcasting to thousands of devices simultaneously
- Configurable flash patterns, colors, and intervals
- Room-based event isolation for multi-event support
- Sub-100ms synchronization latency across connected clients

**Role-Based Access Control**
- Two-tier permission system (Guest and Admin roles)
- Secure invitation-based admin promotion
- Database-enforced role validation on all protected endpoints
- Auto-promotion for default administrator email

**Admin Invitation Workflow**
- Cryptographically secure invitation code generation
- Time-limited, single-use invitation tokens
- Deep-link integration for seamless onboarding
- Audit trail of invitation usage and admin hierarchy

## Technology Stack

### Core Technologies
- **Node.js** (v18+) - High-performance JavaScript runtime with async I/O
- **Express.js** - Minimal web framework for RESTful API design
- **TypeScript** - Static typing for enhanced code reliability and maintainability
- **Socket.io** - Production-grade WebSocket library for real-time bidirectional communication

### Database & ORM
- **PostgreSQL** - Enterprise-grade relational database (Supabase-hosted)
- **Prisma** - Type-safe ORM with automatic migration generation and client typings

### Authentication
- **Clerk** - Modern authentication platform with OAuth support and session management

## API Endpoints

### Authentication
- `POST /api/users/sync` - Sync authenticated user to database
- `GET /api/users/clerk/:clerkId` - Get user by Clerk ID

### Events
- `GET /api/events` - List all events
- `POST /api/events` - Create new event (Admin)
- `PATCH /api/events/:id` - Update event (Admin)
- `DELETE /api/events/:id` - Delete event (Admin)

### Attendance
- `POST /api/attendance/check-in` - Check into event
- `GET /api/attendance/event/:eventId` - Get event attendees
- `GET /api/attendance/event/:eventId/count` - Get attendee count

### Admin Management
- `POST /api/invitations/generate` - Generate admin invitation link
- `GET /api/invitations/:code` - Validate invitation code
- `POST /api/invitations/:code/accept` - Accept invitation

## Real-Time Features

### Socket.io Events

**Client → Server:**
- `joinEvent` - Join event room for updates
- `leaveEvent` - Leave event room
- `triggerFlash` - Trigger synchronized flash (Admin)
- `updateFlashSettings` - Update flash configuration (Admin)

**Server → Client:**
- `flash` - Flash event broadcast
- `attendeeCountUpdate` - Live attendee count
- `flashSettingsUpdated` - Flash settings changed
- `notification` - Event notifications

## Prerequisites

- Node.js 18.x or higher
- PostgreSQL database (Supabase account recommended)
- npm or yarn package manager

## Installation

\`\`\`bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev
\`\`\`

## Configuration

Create a \`.env\` file with the following variables:

\`\`\`env
# Database (Supabase PostgreSQL)
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE

# Server
PORT=3000
NODE_ENV=development

# CORS
ALLOWED_ORIGINS=http://localhost:8081,http://localhost:19006

# Deep linking
APP_URL=exp://localhost:8081
\`\`\`

## Running the Server

### Development
\`\`\`bash
npm run dev
\`\`\`

### Production
\`\`\`bash
npm run build
npm start
\`\`\`

## Database Management

### View database in browser
\`\`\`bash
npx prisma studio
\`\`\`

### Create migration
\`\`\`bash
npx prisma migrate dev --name migration_name
\`\`\`

### Reset database
\`\`\`bash
npx prisma migrate reset
\`\`\`

## Database Schema

The backend utilizes a relational database with seven interconnected tables to ensure data integrity and enable complex queries:

- **User** - User accounts with role assignment and authentication integration
- **Event** - Campus events with timing, location, and flash configuration
- **Facility** - Event venues with capacity and location metadata
- **EventAttendance** - Check-in records linking users to events with session tracking
- **AdminInvitation** - Secure invitation codes for administrative access promotion
- **FlashLog** - Comprehensive audit trail of flash synchronization events
- **NotificationLog** - Push notification delivery tracking and history

## Security & Performance

### Security Measures
- **Environment Isolation** - Sensitive credentials managed via environment variables
- **Database Security** - Row-level security policies and parameterized queries via Prisma
- **API Authorization** - Role-based access control with server-side validation on all protected endpoints
- **CORS Protection** - Configurable cross-origin resource sharing policies
- **Authentication** - Secure password requirements and session management via Clerk
- **Invitation Security** - Cryptographically secure random codes (32-character entropy)

### Performance Optimizations
- **Connection Pooling** - Supabase connection pooler for optimal database throughput
- **Database Indexing** - Strategic indexes on frequently queried columns (clerkId, eventId, role)
- **WebSocket Efficiency** - Room-based broadcasting to minimize unnecessary traffic
- **Type Safety** - Compile-time type checking eliminates entire classes of runtime errors
- **Async Operations** - Non-blocking I/O for handling thousands of concurrent connections

## License

MIT
