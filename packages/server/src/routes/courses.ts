import { Course, CourseStatus } from '@prisma/client';
import { Router } from 'express';
import prisma from '../lib/prisma';

const router = Router();

router.get('/', async (req, res) => {
  const search = req.query.search as string;
  const data = req.body as Course;
  const courses = await prisma.course.findMany({
    where: {
      status: CourseStatus.PUBLISHED,
      name: {
        contains: search || '',
      },
    },
  });

  res.json(courses);
});

export default router;
