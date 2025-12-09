import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { UserRole } from '@prisma/client';

const router = Router();

/**
 * POST /api/users/sync
 * Sync Clerk user to database
 */
router.post('/sync', async (req, res) => {
  try {
    const { clerkId, email, firstName, lastName, profileImageUrl, role } = req.body;

    if (!clerkId || !email) {
      return res.status(400).json({ error: 'clerkId and email are required' });
    }

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (user) {
      // Update existing user
      user = await prisma.user.update({
        where: { clerkId },
        data: {
          email,
          firstName: firstName || user.firstName,
          lastName: lastName || user.lastName,
          profileImageUrl: profileImageUrl || user.profileImageUrl,
          lastActiveAt: new Date(),
        },
      });
    } else {
      // Create new user with specified role or GUEST by default
      const userRole = role === 'ADMIN' ? UserRole.ADMIN : UserRole.GUEST;

      user = await prisma.user.create({
        data: {
          clerkId,
          email,
          firstName,
          lastName,
          profileImageUrl,
          role: userRole,
          lastActiveAt: new Date(),
        },
      });

      console.log(`✅ Created new user: ${email} with role: ${userRole}`);
    }

    res.json(user);
  } catch (error) {
    console.error('Error syncing user:', error);
    res.status(500).json({ error: 'Failed to sync user' });
  }
});

/**
 * GET /api/users/clerk/:clerkId
 * Get user by Clerk ID
 */
router.get('/clerk/:clerkId', async (req, res) => {
  try {
    const { clerkId } = req.params;

    const user = await prisma.user.findUnique({
      where: { clerkId },
      include: {
        eventAttendance: {
          include: {
            event: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

/**
 * PATCH /api/users/:id/role
 * Update user role
 */
router.patch('/:id/role', async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !Object.values(UserRole).includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role },
    });

    res.json(user);
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

/**
 * POST /api/users/:id/push-token
 * Register push notification token
 */
router.post('/:id/push-token', async (req, res) => {
  try {
    const { id } = req.params;
    const { pushToken } = req.body;

    if (!pushToken) {
      return res.status(400).json({ error: 'pushToken is required' });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { pushToken },
    });

    res.json({ success: true, user });
  } catch (error) {
    console.error('Error registering push token:', error);
    res.status(500).json({ error: 'Failed to register push token' });
  }
});

/**
 * PATCH /api/users/:id/notifications
 * Toggle notification settings
 */
router.patch('/:id/notifications', async (req, res) => {
  try {
    const { id } = req.params;
    const { enabled } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: { notificationsEnabled: enabled },
    });

    res.json(user);
  } catch (error) {
    console.error('Error updating notification settings:', error);
    res.status(500).json({ error: 'Failed to update notification settings' });
  }
});

/**
 * GET /api/users/admins/count
 * Get count of all admin users
 */
router.get('/admins/count', async (req, res) => {
  try {
    const count = await prisma.user.count({
      where: { role: UserRole.ADMIN },
    });

    res.json({ count });
  } catch (error) {
    console.error('Error counting admins:', error);
    res.status(500).json({ error: 'Failed to count admins' });
  }
});

/**
 * GET /api/users/admins
 * Get all admin users
 */
router.get('/admins', async (req, res) => {
  try {
    const admins = await prisma.user.findMany({
      where: { role: UserRole.ADMIN },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        profileImageUrl: true,
        createdAt: true,
        lastActiveAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(admins);
  } catch (error) {
    console.error('Error fetching admins:', error);
    res.status(500).json({ error: 'Failed to fetch admins' });
  }
});

export default router;
