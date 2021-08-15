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

export default router;
