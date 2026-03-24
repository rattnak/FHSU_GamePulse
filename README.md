# FHSU GamePulse

A mobile event engagement platform for Fort Hays State University. GamePulse lets attendees participate in synchronized light shows during live campus events — sporting games, commencement ceremonies, and community gatherings — by flashing their phone screens in coordinated patterns controlled by admins in real time.

## What It Does

When an event goes live, an admin can trigger a flash sequence from the app. Every attendee who has checked in receives the signal via WebSocket and their screen flashes in the configured color and pattern simultaneously. The result is a coordinated crowd light display across thousands of devices.

Beyond flash sync, the app handles the full event lifecycle: browsing upcoming events, QR code check-in, real-time attendee counts, admin invitations, and push notification support.

## Architecture

The project is a monorepo with two parts:

- **Frontend** — React Native (Expo) mobile app for iOS, Android, and web
- **Backend** — Node.js/Express API server with Socket.io for real-time communication

```
fhsu_gamepulse/
├── app/                  # Expo Router screens
├── components/
│   ├── admin/            # Admin controls (EventControl, TriggerButton, LiveDeviceCount, AnnouncementForm)
│   ├── auth/             # Auth components (VerificationCode, SetPassword)
│   ├── event/            # Event UI (EventCard, EventList, FlashScreen, CheckInModal, CountdownTimer)
│   ├── facility/         # Venue components (FacilityCard, FacilityList, InteractiveMap, SeatingChart)
│   ├── game/             # Game UI (FlashController, FlashAnimation, GameStatus, Scoreboard, TeamColor)
│   ├── profile/          # Profile views (GuestProfileView, AdminDashboardView)
│   ├── shared/           # Shared UI (Header, QRScanner, NetworkStatus, TabNavigation)
│   └── ui/               # Base UI primitives (Button, Card, Input, Toast, LoadingSpinner)
└── backend/
    └── src/
        ├── index.ts      # Express + Socket.io server
        └── routes/
            ├── events.ts      # Event CRUD + flash settings + flash logs
            ├── attendance.ts  # Check-in/check-out + attendance queries
            ├── users.ts       # User sync, role management, push tokens
            └── invitations.ts # Admin invitation generation and acceptance
```

## Technology Stack

### Frontend
- **React Native** with Expo SDK 54
- **TypeScript**
- **Expo Router** — file-based navigation with deep linking
- **Clerk (`@clerk/clerk-expo`)** — authentication (email/password + OAuth)
- **Socket.io Client** — real-time WebSocket communication
- **Zustand** — state management

### Backend
- **Node.js** + **Express.js** — REST API
- **TypeScript**
- **Socket.io** — real-time bidirectional communication (flash sync, attendee counts, notifications)
- **Prisma** — ORM with PostgreSQL
- **Supabase** — PostgreSQL hosting

## Database Schema

Seven tables managed by Prisma:

| Table | Purpose |
|---|---|
| `User` | Accounts with `GUEST` or `ADMIN` role, synced from Clerk |
| `Event` | Campus events with timing, flash color config, live status, and QR code URL |
| `Facility` | Event venues with address and capacity |
| `EventAttendance` | Check-in records with status (`PENDING`, `CHECKED_IN`, `NO_SHOW`) and device info |
| `AdminInvitation` | One-time invite codes for promoting users to admin |
| `FlashLog` | Audit log of every flash trigger (who, when, how many users) |
| `NotificationLog` | Record of push notifications sent |

## API Endpoints

### Events — `/api/events`
- `GET /` — list events (filter by `?isLive=true` or `?upcoming=true`)
- `GET /:id` — event detail with checked-in attendees
- `PATCH /:id/live` — toggle event live status
- `PATCH /:id/flash-settings` — update flash color/interval config
- `POST /:id/flash-log` — record a flash trigger

### Attendance — `/api/attendance`
- `POST /check-in` — check user into a live event
- `POST /check-out` — check user out
- `GET /event/:eventId` — list attendees for an event
- `GET /event/:eventId/count` — get total and checked-in counts
- `GET /user/:userId` — user's full attendance history
- `GET /user/:userId/event/:eventId` — user's status for a specific event

### Users — `/api/users`
- `POST /sync` — upsert Clerk user into the database
- `GET /clerk/:clerkId` — fetch user with recent attendance
- `PATCH /:id/role` — change user role (`GUEST` / `ADMIN`)
- `POST /:id/push-token` — register Expo push token
- `PATCH /:id/notifications` — toggle notification preference
- `GET /admins` — list all admin users
- `GET /admins/count` — count of admins

### Invitations — `/api/invitations`
- `POST /generate` — create a 16-character invite code (admin only)
- `GET /:inviteCode` — validate an invite code
- `POST /:inviteCode/accept` — accept invite and promote user to admin
- `GET /user/:userId/created` — list invites created by a user

## WebSocket Events (Socket.io)

| Event (client → server) | Description |
|---|---|
| `joinEvent` | Join an event room; broadcasts updated attendee count |
| `leaveEvent` | Leave an event room; updates attendee count |
| `triggerFlash` | Admin triggers flash for all users in event room |
| `updateFlashSettings` | Admin pushes new flash config to all clients |
| `sendEventNotification` | Admin broadcasts a notification message |
| `getActiveCount` | Request current active count for an event |

| Event (server → client) | Description |
|---|---|
| `flash` | Flash payload with color, duration, pattern, timestamp |
| `flashSettingsUpdated` | Updated flash interval/color config |
| `attendeeCountUpdate` | Live attendee count for an event |
| `notification` | Announcement title and body |

## Quick Start

### Prerequisites
- Node.js 18+
- A [Clerk](https://clerk.com) account for authentication
- A [Supabase](https://supabase.com) project for PostgreSQL

### 1. Clone and install

```bash
git clone https://github.com/rattnak/FHSU_GamePulse.git
cd FHSU_GamePulse

# Frontend
npm install

# Backend
cd backend && npm install
```

### 2. Configure environment

**Root `.env`** (used by both frontend and backend):
```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
EXPO_PUBLIC_API_URL=http://localhost:3000
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE
PORT=3000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:8081,http://localhost:19006
APP_URL=exp://localhost:8081
```

### 3. Set up the database

```bash
cd backend
npx prisma migrate dev
npx prisma generate
```

### 4. Run

```bash
# Terminal 1 — backend
cd backend && npm run dev

# Terminal 2 — frontend
npm start
# Press 'i' for iOS Simulator, 'a' for Android, or scan QR with Expo Go
```

## Development

```bash
# View/edit database in browser
npx prisma studio

# Type-check frontend
npx tsc --noEmit

# Type-check backend
cd backend && npx tsc --noEmit
```

## User Roles

| Capability | Guest | Admin |
|---|---|---|
| Browse events | Yes | Yes |
| Check in via QR code | Yes | Yes |
| Receive flash sync | Yes | Yes |
| View attendance history | Yes | Yes |
| Create/edit/delete events | No | Yes |
| Toggle event live status | No | Yes |
| Trigger flash sequences | No | Yes |
| Configure flash settings | No | Yes |
| Send event announcements | No | Yes |
| Manage facilities | No | Yes |
| Generate admin invitations | No | Yes |

---

Built for Fort Hays State University — CSCI capstone project
