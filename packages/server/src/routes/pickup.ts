import { PickupStatus } from '@prisma/client';
import { Router } from 'express';
import prisma from '../lib/prisma';
import { ensureAuthenticated } from '../middleware/auth';

const router = Router();

router.get('/', ensureAuthenticated, async (req, res) => {
  if (!req.user) return;

  const pickups = await prisma.donation.findMany({
    where: { pickup: { assignedToId: req.user.id } },
    include: {
      donator: true,
      ngo: true,
      pickup: true,
    },
  });

  res.json(pickups);
});

router.post('/:id/start', ensureAuthenticated, async (req, res) => {
  if (!req.user) return;
  const donationId = req.params.id as string;

  await prisma.pickup.update({
    where: { id: donationId },
    data: {
      status: PickupStatus.ACTIVE,
    },
  });
});

router.post('/:id/complete', ensureAuthenticated, async (req, res) => {
  if (!req.user) return;
  const donationId = req.params.id as string;

  await prisma.pickup.update({
    where: { id: donationId },
    data: {
      status: PickupStatus.COMPLETED,
    },
  });
});

export default router;
