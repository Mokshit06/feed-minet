import { Router } from 'express';
import prisma from '../lib/prisma';
import { ensureAuthenticated } from '../middleware/auth';
import authRouter from './auth';
import donationRouter from './donation';
import pickupRouter from './pickup';

const router = Router();

router.get('/', (req, res) => {
  res.send('API running');
});

router.use('/auth', authRouter);
router.use('/donation', donationRouter);
router.use('/pickup', pickupRouter);
router.get('/ngo', async (req, res) => {
  const ngos = await prisma.ngo.findMany();
  res.json(ngos);
});
router.post('/ngo/register', ensureAuthenticated, async (req, res) => {
  const data = req.body as {
    name: string;
    address: string;
    numberOfPeople: number;
  };

  await prisma.ngo.create({
    data: {
      name: data.name,
      address: data.address,
      numberOfPeople: data.numberOfPeople,
    },
  });

  res.json({
    message: 'NGO registered',
  });
});

export default router;
