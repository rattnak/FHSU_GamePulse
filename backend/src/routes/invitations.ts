import { Router } from 'express';
import { nanoid } from 'nanoid';
import { prisma } from '../lib/prisma';
import { UserRole } from '@prisma/client';

const router = Router();

/**
 * POST /api/invitations/generate
 * Generate admin invitation link
 */
router.post('/generate', async (req, res) => {
  try {
    const { createdById, email, expiresInHours } = req.body;

    if (!createdById) {
      return res.status(400).json({ error: 'createdById is required' });
    }

    // Verify creator is admin
    const creator = await prisma.user.findUnique({
      where: { id: createdById },
    });

    if (!creator || creator.role !== UserRole.ADMIN) {
      return res.status(403).json({ error: 'Only admins can create invitations' });
    }

    // Generate unique invite code
    const inviteCode = nanoid(16);

    // Calculate expiration if specified
    let expiresAt: Date | undefined;
    if (expiresInHours) {
      expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + expiresInHours);
    }

    // Create invitation
    const invitation = await prisma.adminInvitation.create({
      data: {
        inviteCode,
        email,
        createdById,
        expiresAt,
      },
    });

    res.json({
      invitation,
      inviteLink: `${process.env.APP_URL || 'exp://localhost:8081'}/--/admin-invite/${inviteCode}`,
    });
  } catch (error) {
    console.error('Error generating invitation:', error);
    res.status(500).json({ error: 'Failed to generate invitation' });
  }
});

/**
 * GET /api/invitations/:inviteCode
 * Validate invitation code
 */
router.get('/:inviteCode', async (req, res) => {
  try {
    const { inviteCode } = req.params;

    const invitation = await prisma.adminInvitation.findUnique({
      where: { inviteCode },
      include: {
        createdBy: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!invitation) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    // Check if already used
    if (invitation.isUsed) {
      return res.status(400).json({ error: 'Invitation already used' });
    }

    // Check if expired
    if (invitation.expiresAt && invitation.expiresAt < new Date()) {
      return res.status(400).json({ error: 'Invitation expired' });
    }

    res.json({ invitation, valid: true });
  } catch (error) {
    console.error('Error validating invitation:', error);
    res.status(500).json({ error: 'Failed to validate invitation' });
  }
});

/**
 * POST /api/invitations/:inviteCode/accept
 * Accept admin invitation
 */
router.post('/:inviteCode/accept', async (req, res) => {
  try {
    const { inviteCode } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Get invitation
    const invitation = await prisma.adminInvitation.findUnique({
      where: { inviteCode },
    });

    if (!invitation) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    if (invitation.isUsed) {
      return res.status(400).json({ error: 'Invitation already used' });
    }

    if (invitation.expiresAt && invitation.expiresAt < new Date()) {
      return res.status(400).json({ error: 'Invitation expired' });
    }

    // Update user to ADMIN role and mark invitation as used
    const [user, updatedInvitation] = await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { role: UserRole.ADMIN },
      }),
      prisma.adminInvitation.update({
        where: { inviteCode },
        data: {
          isUsed: true,
          usedById: userId,
          usedAt: new Date(),
        },
      }),
    ]);

    res.json({ user, invitation: updatedInvitation });
  } catch (error) {
    console.error('Error accepting invitation:', error);
    res.status(500).json({ error: 'Failed to accept invitation' });
  }
});

/**
 * GET /api/invitations/user/:userId/created
 * Get invitations created by user
 */
router.get('/user/:userId/created', async (req, res) => {
  try {
    const { userId } = req.params;

    const invitations = await prisma.adminInvitation.findMany({
      where: { createdById: userId },
      include: {
        usedBy: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(invitations);
  } catch (error) {
    console.error('Error fetching invitations:', error);
    res.status(500).json({ error: 'Failed to fetch invitations' });
  }
});

export default router;
