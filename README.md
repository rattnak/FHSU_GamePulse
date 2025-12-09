# FHSU GamePulse

A comprehensive event management and real-time engagement platform designed to revolutionize the campus experience at Fort Hays State University. FHSU GamePulse transforms passive event attendance into an interactive, synchronized experience through mobile technology and real-time communication.

## Overview

FHSU GamePulse is a full-stack Progressive Web Application that combines event management, attendance tracking, and real-time crowd engagement features. The platform enables thousands of attendees to participate in coordinated experiences during live events, creating an electrifying unified atmosphere for sporting events, commencement ceremonies, and community gatherings.

### Key Features

**Real-Time Flash Synchronization**
- Synchronized screen flashing across thousands of devices simultaneously
- Sub-100ms latency for coordinated crowd displays
- Configurable patterns, colors, and intervals
- Creates unified visual experiences during game highlights and celebrations

**Comprehensive Event Management**
- Complete event lifecycle management (creation, updates, live status)
- Support for multiple event categories (sports, commencement, community)
- Facility association with venue capacity tracking
- QR code generation for streamlined check-ins

**Smart Attendance Tracking**
- Instant check-in/check-out with sub-second processing
- Real-time attendee counts via WebSocket
- Session-based tracking for flash participation
- Comprehensive attendance history and analytics

**Role-Based Access Control**
- Two-tier permission system (Guest and Admin)
- Secure invitation-based admin promotion
- Database-enforced authorization on all endpoints
- Auto-promotion for designated administrator emails

**Modern PWA Experience**
- Offline-first architecture for unreliable network conditions
- Push notification support for event updates
- Installable on iOS, Android, and desktop
- Responsive design optimized for all screen sizes

## Technology Stack

### Frontend
- **React Native** with Expo SDK 54 - Cross-platform mobile development
- **TypeScript** - Type-safe development with enhanced maintainability
- **Expo Router** - File-based navigation with deep linking
- **Zustand** - Lightweight state management
- **Socket.io Client** - Real-time WebSocket communication
- **Clerk** - Modern authentication with OAuth support

### Backend
- **Node.js** (v18+) with Express.js - RESTful API server
- **TypeScript** - Full-stack type safety
- **Socket.io** - Real-time bidirectional communication
- **PostgreSQL** - Enterprise-grade relational database (Supabase)
- **Prisma** - Type-safe ORM with automatic migrations

### Infrastructure
- **Supabase** - PostgreSQL hosting with connection pooling
- **Clerk** - Authentication and user management
- **Expo** - Build, deploy, and iterate quickly

## Quick Start

### Prerequisites
- Node.js 18.x or higher
- npm or yarn package manager
- Expo CLI (optional, recommended)

### Installation

```bash
# Clone repository
git clone https://github.com/rattnak/FHSU_GamePulse.git
cd FHSU_GamePulse

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Generate Prisma client
npx prisma generate
```

### Configuration

Create `.env` files:

**Frontend `.env`:**
```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
EXPO_PUBLIC_API_URL=http://localhost:3000
```

**Backend `.env`:**
```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE
PORT=3000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:8081,http://localhost:19006
APP_URL=exp://localhost:8081
```

### Running the Application

**Start Backend:**
```bash
cd backend
npm run dev
```

**Start Frontend:**
```bash
# In root directory
npm start

# Then press:
# - 'i' for iOS Simulator
# - 'a' for Android Emulator
# - Scan QR code with Expo Go for physical device
```

## Core Functionality

### For All Users (Guest & Admin)
- Browse upcoming and live campus events
- View detailed event information (time, location, description)
- Real-time flash synchronization during live events
- Interactive countdown timers for upcoming events
- Push notification support for event updates
- Secure authentication (email/password or Google OAuth)
- WCAG 2.1 Level AA accessible interface

### For Administrators
- Complete event management (create, update, delete)
- Real-time attendance tracking and analytics
- User role management and admin invitations
- Flash control system for synchronized displays
- Facility management for event venues
- Comprehensive dashboard with statistics

### For Guest Users
- Event check-in via QR code scanning
- Personal attendance history
- Event notifications and reminders
- Profile management and settings

## Database Schema

Seven interconnected tables ensure data integrity:
- **User** - Accounts with role assignment and auth integration
- **Event** - Campus events with timing and flash configuration
- **Facility** - Event venues with capacity metadata
- **EventAttendance** - Check-in records with session tracking
- **AdminInvitation** - Secure codes for admin promotion
- **FlashLog** - Audit trail of synchronization events
- **NotificationLog** - Push notification history

## Security & Performance

### Security Features
- Environment-based configuration for sensitive credentials
- Row-level security policies via Prisma
- Role-based API authorization with server-side validation
- CORS protection with configurable origins
- Secure password requirements via Clerk
- Cryptographically secure invitation codes (32-character entropy)

### Performance Optimizations
- Connection pooling via Supabase for optimal throughput
- Strategic database indexing on frequently queried columns
- WebSocket room-based broadcasting to minimize traffic
- Type-safe queries eliminating runtime errors
- Non-blocking async I/O for thousands of concurrent connections

## API Documentation

### RESTful Endpoints
- **Authentication**: User sync, role management
- **Events**: CRUD operations, live status control
- **Attendance**: Check-in/out, attendee counts
- **Invitations**: Admin promotion system

### WebSocket Events
- **Flash synchronization**: Real-time broadcast to all attendees
- **Attendee counts**: Live updates during events
- **Settings updates**: Dynamic flash configuration
- **Notifications**: Event-specific announcements

## Development

### Database Management
```bash
# View database in browser
npx prisma studio

# Create migration
npx prisma migrate dev --name migration_name

# Reset database
npx prisma migrate reset
```

### Type Checking
```bash
# Frontend
npx tsc --noEmit

# Backend
cd backend && npx tsc --noEmit
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - See LICENSE file for details

## Contact

**Project Repository**: [https://github.com/rattnak/FHSU_GamePulse](https://github.com/rattnak/FHSU_GamePulse)

---

*Built for Fort Hays State University to enhance campus event engagement through technology* 
