-- FHSU GamePulse Database Setup Script (Safe Version)
-- This script checks if things exist before creating them
-- Safe to run multiple times

-- Create enum types if they don't exist
DO $$ BEGIN
    CREATE TYPE "UserRole" AS ENUM ('GUEST', 'ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "AttendanceStatus" AS ENUM ('PENDING', 'CHECKED_IN', 'NO_SHOW');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create User table if it doesn't exist
CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "clerkId" TEXT NOT NULL UNIQUE,
  "email" TEXT NOT NULL UNIQUE,
  "firstName" TEXT,
  "lastName" TEXT,
  "role" "UserRole" NOT NULL DEFAULT 'GUEST',
  "profileImageUrl" TEXT,
  "pushToken" TEXT UNIQUE,
  "notificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastActiveAt" TIMESTAMP(3)
);

-- Create indexes for User (if they don't exist)
CREATE INDEX IF NOT EXISTS "User_clerkId_idx" ON "User"("clerkId");
CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email");
CREATE INDEX IF NOT EXISTS "User_role_idx" ON "User"("role");

-- Create AdminInvitation table if it doesn't exist
CREATE TABLE IF NOT EXISTS "AdminInvitation" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "inviteCode" TEXT NOT NULL UNIQUE,
  "email" TEXT,
  "createdById" TEXT NOT NULL,
  "usedById" TEXT UNIQUE,
  "isUsed" BOOLEAN NOT NULL DEFAULT false,
  "expiresAt" TIMESTAMP(3),
  "usedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE,
  FOREIGN KEY ("usedById") REFERENCES "User"("id") ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS "AdminInvitation_inviteCode_idx" ON "AdminInvitation"("inviteCode");
CREATE INDEX IF NOT EXISTS "AdminInvitation_createdById_idx" ON "AdminInvitation"("createdById");

-- Create Facility table if it doesn't exist
CREATE TABLE IF NOT EXISTS "Facility" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL UNIQUE,
  "blueprint" TEXT,
  "address" TEXT,
  "capacity" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "Facility_slug_idx" ON "Facility"("slug");

-- Create Event table if it doesn't exist
CREATE TABLE IF NOT EXISTS "Event" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "title" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "description" TEXT,
  "imageUrl" TEXT,
  "facilityId" TEXT NOT NULL,
  "startTime" TIMESTAMP(3) NOT NULL,
  "endTime" TIMESTAMP(3) NOT NULL,
  "isLive" BOOLEAN NOT NULL DEFAULT false,
  "qrCodeUrl" TEXT,
  "flashEnabled" BOOLEAN NOT NULL DEFAULT false,
  "flashInterval" INTEGER NOT NULL DEFAULT 3000,
  "flashColor1" TEXT NOT NULL DEFAULT '#FDB913',
  "flashColor2" TEXT NOT NULL DEFAULT '#000000',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "Event_isLive_idx" ON "Event"("isLive");
CREATE INDEX IF NOT EXISTS "Event_startTime_idx" ON "Event"("startTime");
CREATE INDEX IF NOT EXISTS "Event_facilityId_idx" ON "Event"("facilityId");

-- Create EventAttendance table if it doesn't exist
CREATE TABLE IF NOT EXISTS "EventAttendance" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "status" "AttendanceStatus" NOT NULL DEFAULT 'PENDING',
  "checkedInAt" TIMESTAMP(3),
  "checkOutAt" TIMESTAMP(3),
  "deviceInfo" JSONB,
  "sessionId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
  FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE,
  UNIQUE ("userId", "eventId")
);

CREATE INDEX IF NOT EXISTS "EventAttendance_eventId_idx" ON "EventAttendance"("eventId");
CREATE INDEX IF NOT EXISTS "EventAttendance_userId_idx" ON "EventAttendance"("userId");
CREATE INDEX IF NOT EXISTS "EventAttendance_status_idx" ON "EventAttendance"("status");

-- Create FlashLog table if it doesn't exist
CREATE TABLE IF NOT EXISTS "FlashLog" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "eventId" TEXT NOT NULL,
  "triggeredBy" TEXT,
  "triggeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "duration" INTEGER NOT NULL,
  "pattern" TEXT,
  "activeUsers" INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "FlashLog_eventId_idx" ON "FlashLog"("eventId");
CREATE INDEX IF NOT EXISTS "FlashLog_triggeredAt_idx" ON "FlashLog"("triggeredAt");

-- Create NotificationLog table if it doesn't exist
CREATE TABLE IF NOT EXISTS "NotificationLog" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT,
  "eventId" TEXT,
  "title" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "data" JSONB,
  "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deliveryStatus" TEXT NOT NULL DEFAULT 'sent'
);

CREATE INDEX IF NOT EXISTS "NotificationLog_userId_idx" ON "NotificationLog"("userId");
CREATE INDEX IF NOT EXISTS "NotificationLog_eventId_idx" ON "NotificationLog"("eventId");
CREATE INDEX IF NOT EXISTS "NotificationLog_sentAt_idx" ON "NotificationLog"("sentAt");

-- Insert sample facility if it doesn't exist
INSERT INTO "Facility" ("id", "name", "slug", "address", "capacity")
SELECT gen_random_uuid()::text, 'Gross Memorial Coliseum', 'gross-coliseum', '600 Park St, Hays, KS 67601', 7000
WHERE NOT EXISTS (SELECT 1 FROM "Facility" WHERE "slug" = 'gross-coliseum');

-- Verify setup
SELECT
  (SELECT COUNT(*) FROM "User") as users_count,
  (SELECT COUNT(*) FROM "Facility") as facilities_count,
  (SELECT COUNT(*) FROM "Event") as events_count,
  'Database setup complete! ✅' as status;
