-- FHSU GamePulse Database Setup Script
-- Copy and paste this entire script into Supabase SQL Editor

-- Create enum types
CREATE TYPE "UserRole" AS ENUM ('GUEST', 'ADMIN');
CREATE TYPE "AttendanceStatus" AS ENUM ('PENDING', 'CHECKED_IN', 'NO_SHOW');

-- Create User table
CREATE TABLE "User" (
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

-- Create indexes for User
CREATE INDEX "User_clerkId_idx" ON "User"("clerkId");
CREATE INDEX "User_email_idx" ON "User"("email");
CREATE INDEX "User_role_idx" ON "User"("role");

-- Create AdminInvitation table
CREATE TABLE "AdminInvitation" (
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

CREATE INDEX "AdminInvitation_inviteCode_idx" ON "AdminInvitation"("inviteCode");
CREATE INDEX "AdminInvitation_createdById_idx" ON "AdminInvitation"("createdById");

-- Create Facility table
CREATE TABLE "Facility" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL UNIQUE,
  "blueprint" TEXT,
  "address" TEXT,
  "capacity" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "Facility_slug_idx" ON "Facility"("slug");

-- Create Event table
CREATE TABLE "Event" (
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

CREATE INDEX "Event_isLive_idx" ON "Event"("isLive");
CREATE INDEX "Event_startTime_idx" ON "Event"("startTime");
CREATE INDEX "Event_facilityId_idx" ON "Event"("facilityId");

-- Create EventAttendance table
CREATE TABLE "EventAttendance" (
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

CREATE INDEX "EventAttendance_eventId_idx" ON "EventAttendance"("eventId");
CREATE INDEX "EventAttendance_userId_idx" ON "EventAttendance"("userId");
CREATE INDEX "EventAttendance_status_idx" ON "EventAttendance"("status");

-- Create FlashLog table
CREATE TABLE "FlashLog" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "eventId" TEXT NOT NULL,
  "triggeredBy" TEXT,
  "triggeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "duration" INTEGER NOT NULL,
  "pattern" TEXT,
  "activeUsers" INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE
);

CREATE INDEX "FlashLog_eventId_idx" ON "FlashLog"("eventId");
CREATE INDEX "FlashLog_triggeredAt_idx" ON "FlashLog"("triggeredAt");

-- Create NotificationLog table
CREATE TABLE "NotificationLog" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT,
  "eventId" TEXT,
  "title" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "data" JSONB,
  "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deliveryStatus" TEXT NOT NULL DEFAULT 'sent'
);

CREATE INDEX "NotificationLog_userId_idx" ON "NotificationLog"("userId");
CREATE INDEX "NotificationLog_eventId_idx" ON "NotificationLog"("eventId");
CREATE INDEX "NotificationLog_sentAt_idx" ON "NotificationLog"("sentAt");

-- Insert sample facility for testing
INSERT INTO "Facility" ("id", "name", "slug", "address", "capacity")
VALUES (gen_random_uuid()::text, 'Gross Memorial Coliseum', 'gross-coliseum', '600 Park St, Hays, KS 67601', 7000);

-- Success message
SELECT 'Database tables created successfully! ✅' as status;
