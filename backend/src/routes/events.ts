import { Router } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

/**
 * GET /api/events
 * Get all events
 */
router.get('/', async (req, res) => {
  try {
    const { isLive, upcoming } = req.query;

    const where: any = {};

    if (isLive !== undefined) {
      where.isLive = isLive === 'true';
    }

    if (upcoming === 'true') {
      where.startTime = {
        gte: new Date(),
      };
    }

    const events = await prisma.event.findMany({
      where,
      include: {
        facility: true,
        attendance: {
          where: {
            status: 'CHECKED_IN',
          },
          select: {
            id: true,
          },
        },
      },
      orderBy: { startTime: 'asc' },
    });

    // Add attendee count to each event
    const eventsWithCount = events.map((event) => ({
      ...event,
      attendeeCount: event.attendance.length,
      attendance: undefined, // Remove attendance array from response
    }));

    res.json(eventsWithCount);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

/**
 * GET /api/events/:id
 * Get event by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        facility: true,
        attendance: {
          where: {
            status: 'CHECKED_IN',
          },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profileImageUrl: true,
              },
            },
          },
        },
      },
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

/**
 * PATCH /api/events/:id/live
 * Toggle event live status
 */
router.patch('/:id/live', async (req, res) => {
  try {
    const { id } = req.params;
    const { isLive } = req.body;

    const event = await prisma.event.update({
      where: { id },
      data: { isLive },
    });

    res.json(event);
  } catch (error) {
    console.error('Error updating event live status:', error);
    res.status(500).json({ error: 'Failed to update event live status' });
  }
});

/**
 * PATCH /api/events/:id/flash-settings
 * Update flash screen settings for event
 */
router.patch('/:id/flash-settings', async (req, res) => {
  try {
    const { id } = req.params;
    const { flashEnabled, flashInterval, flashColor1, flashColor2 } = req.body;

    const event = await prisma.event.update({
      where: { id },
      data: {
        flashEnabled,
        flashInterval,
        flashColor1,
        flashColor2,
      },
    });

    res.json(event);
  } catch (error) {
    console.error('Error updating flash settings:', error);
    res.status(500).json({ error: 'Failed to update flash settings' });
  }
});

/**
 * POST /api/events/:id/flash-log
 * Log a flash event
 */
router.post('/:id/flash-log', async (req, res) => {
  try {
    const { id } = req.params;
    const { triggeredBy, duration, pattern, activeUsers } = req.body;

    const flashLog = await prisma.flashLog.create({
      data: {
        eventId: id,
        triggeredBy,
        duration,
        pattern,
        activeUsers,
      },
    });

    res.json(flashLog);
  } catch (error) {
    console.error('Error logging flash:', error);
    res.status(500).json({ error: 'Failed to log flash' });
  }
});

export default router;
