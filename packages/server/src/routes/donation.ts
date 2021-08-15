import { UserRole } from '.prisma/client';
import { Ngo } from '.prisma/client';
import { Router } from 'express';
import prisma from '../lib/prisma';
import { ensureAuthenticated } from '../middleware/auth';

const router = Router();

router.post('/', ensureAuthenticated, async (req, res) => {
  if (!req.user) return;

  const data = req.body as {
    ngoId?: string;
    nearest: boolean;
    description: string;
    quantity: number;
  };

  let ngo: Ngo;

  if (data.nearest) {
    // TODO calc nearest ngo
    ngo = await prisma.ngo.findFirst();
  } else {
    ngo = await prisma.ngo.findUnique({
      where: { id: data.ngoId },
    });
  }

  // TODO find the nearest driver based on `currentCoords`
  const assignedTo = await prisma.user.findFirst({
    where: { role: UserRole.PICKUP },
  });

  await prisma.donation.create({
    data: {
      description: data.description,
      quantity: data.quantity,
      donatorId: req.user.id,
      ngoId: ngo.id,
      pickup: {
        create: {
          assignedToId: assignedTo.id,
          currentCoords: [],
        },
      },
    },
  });

  res.json({
    message: 'Thanks for your contribution!',
  });
});

export default router;
