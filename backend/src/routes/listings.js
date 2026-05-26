import { Router } from 'express';
import prisma from '../utils/prisma.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const { expertise, city, language, category, page = 1, limit = 12 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = {
      isActive: true,
      expert: { subStatus: 'ACTIVE', isActive: true },
      ...(city && { city: { contains: city, mode: 'insensitive' } }),
      ...(category && { category: { equals: category, mode: 'insensitive' } }),
      ...(expertise && { expertise: { has: expertise } }),
      ...(language && { languages: { has: language } }),
    };

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          expert: {
            select: { id: true, firstName: true, lastName: true, isVerified: true, avatarUrl: true, city: true, category: true },
          },
          reviews: { select: { rating: true } },
        },
      }),
      prisma.listing.count({ where }),
    ]);

    res.json({ listings, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: req.params.id },
      include: {
        expert: { select: { id: true, firstName: true, lastName: true, isVerified: true, avatarUrl: true, bio: true, city: true, category: true, areasOfExpertise: true } },
        reviews: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!listing) return res.status(404).json({ error: 'Anunț negăsit' });
    res.json({ listing });
  } catch (err) {
    next(err);
  }
});

router.post('/', requireAuth, async (req, res, next) => {
  try {
    const expert = await prisma.expert.findUnique({ where: { id: req.expert.id }, select: { subStatus: true } });
    if (expert?.subStatus !== 'ACTIVE') {
      return res.status(403).json({ error: 'Abonament inactiv. Activați un abonament pentru a posta anunțuri.' });
    }

    const { title, description, category, expertise, languages, city, region } = req.body;
    const listing = await prisma.listing.create({
      data: { expertId: req.expert.id, title, description, category, expertise, languages, city: city || '', region: region || '' },
    });
    res.status(201).json({ listing });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', requireAuth, async (req, res, next) => {
  try {
    const existing = await prisma.listing.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.expertId !== req.expert.id) {
      return res.status(403).json({ error: 'Acces interzis' });
    }
    const { title, description, category, expertise, languages, city, region, isActive } = req.body;
    const listing = await prisma.listing.update({
      where: { id: req.params.id },
      data: { title, description, category, expertise, languages, city, region, isActive },
    });
    res.json({ listing });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const existing = await prisma.listing.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.expertId !== req.expert.id) {
      return res.status(403).json({ error: 'Acces interzis' });
    }
    await prisma.listing.delete({ where: { id: req.params.id } });
    res.json({ message: 'Anunț șters' });
  } catch (err) {
    next(err);
  }
});

export default router;
