import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { AttendanceStatus } from '@prisma/client';

const router = Router();

/**
 * POST /api/attendance/check-in
 * Check in to an event
 */
router.post('/check-in', async (req, res) => {
  try {
    const { userId, eventId, deviceInfo, sessionId } = req.body;

    if (!userId || !eventId) {
      return res.status(400).json({ error: 'userId and eventId are required' });
    }

    // Check if event exists and is live
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (!event.isLive) {
      return res.status(400).json({ error: 'Event is not live' });
    }

    // Check if already checked in
    const existing = await prisma.eventAttendance.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId,
        },
      },
    });

    let attendance;

    if (existing) {
      // Update existing attendance
      attendance = await prisma.eventAttendance.update({
        where: { id: existing.id },
        data: {
          status: AttendanceStatus.CHECKED_IN,
          checkedInAt: new Date(),
          deviceInfo,
          sessionId,
        },
        include: {
          event: true,
        },
      });
    } else {
      // Create new attendance
      attendance = await prisma.eventAttendance.create({
        data: {
          userId,
          eventId,
          status: AttendanceStatus.CHECKED_IN,
          checkedInAt: new Date(),
          deviceInfo,
          sessionId,
        },
        include: {
          event: true,
        },
      });
    }

    res.json(attendance);
  } catch (error) {
    console.error('Error checking in:', error);
    res.status(500).json({ error: 'Failed to check in' });
  }
});

/**
 * POST /api/attendance/check-out
 * Check out from an event
 */
router.post('/check-out', async (req, res) => {
  try {
    const { userId, eventId } = req.body;

    if (!userId || !eventId) {
      return res.status(400).json({ error: 'userId and eventId are required' });
    }

    const attendance = await prisma.eventAttendance.updateMany({
      where: {
        userId,
        eventId,
        status: AttendanceStatus.CHECKED_IN,
      },
      data: {
        checkOutAt: new Date(),
      },
    });

    res.json({ success: true, attendance });
  } catch (error) {
    console.error('Error checking out:', error);
    res.status(500).json({ error: 'Failed to check out' });
  }
});

/**
 * GET /api/attendance/event/:eventId
 * Get all attendees for an event
 */
router.get('/event/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    const { status } = req.query;

    const where: any = { eventId };
    if (status) {
      where.status = status;
    }

    const attendance = await prisma.eventAttendance.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            profileImageUrl: true,
          },
        },
      },
      orderBy: { checkedInAt: 'desc' },
    });

    res.json(attendance);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
});

/**
 * GET /api/attendance/event/:eventId/count
 * Get attendance count for an event
 */
router.get('/event/:eventId/count', async (req, res) => {
  try {
    const { eventId } = req.params;

    const total = await prisma.eventAttendance.count({
      where: { eventId },
    });

    const checkedIn = await prisma.eventAttendance.count({
      where: {
        eventId,
        status: AttendanceStatus.CHECKED_IN,
      },
    });

    res.json({ total, checkedIn });
  } catch (error) {
    console.error('Error counting attendance:', error);
    res.status(500).json({ error: 'Failed to count attendance' });
  }
});

/**
 * GET /api/attendance/user/:userId
 * Get user's event attendance history
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const attendance = await prisma.eventAttendance.findMany({
      where: { userId },
      include: {
        event: {
          include: {
            facility: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(attendance);
  } catch (error) {
    console.error('Error fetching user attendance:', error);
    res.status(500).json({ error: 'Failed to fetch user attendance' });
  }
});

/**
 * GET /api/attendance/user/:userId/event/:eventId
 * Get user's attendance status for specific event
 */
router.get('/user/:userId/event/:eventId', async (req, res) => {
  try {
    const { userId, eventId } = req.params;

    const attendance = await prisma.eventAttendance.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId,
        },
      },
      include: {
        event: true,
      },
    });

    res.json(attendance || null);
  } catch (error) {
    console.error('Error fetching attendance status:', error);
    res.status(500).json({ error: 'Failed to fetch attendance status' });
  }
});

export default router;
