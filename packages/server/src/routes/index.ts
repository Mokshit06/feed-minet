import { Router } from 'express';
import prisma from '../lib/prisma';
import { ensureAuthenticated } from '../middleware/auth';
import authRouter from './auth';
import donationRouter from './donation';

const router = Router();

router.get('/', (req, res) => {
  res.send('API running');
});

router.use('/auth', authRouter);
router.use('/donation', donationRouter);
router.get('/ngos', async (req, res) => {
  const ngos = await prisma.ngo.findMany();
  res.json(ngos);
});

export default router;
