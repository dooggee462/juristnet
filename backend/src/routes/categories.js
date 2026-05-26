import { Router } from 'express';
import prisma from '../utils/prisma.js';

const router = Router();

// Public: list all categories with sub-professions
router.get('/', async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      include: { subProfessions: { orderBy: { name: 'asc' } } },
      orderBy: { name: 'asc' },
    });
    res.json({ categories });
  } catch (err) {
    next(err);
  }
});

export default router;
