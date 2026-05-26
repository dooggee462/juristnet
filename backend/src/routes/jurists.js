import { Router } from 'express';
import prisma from '../utils/prisma.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Public: list/search experts
router.get('/', async (req, res, next) => {
  try {
    const { expertise, city, language, category, search, page = 1, limit = 12 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = {
      isActive: true,
      subStatus: 'ACTIVE',
      ...(city && { city: { contains: city, mode: 'insensitive' } }),
      ...(category && { category: { equals: category, mode: 'insensitive' } }),
      ...(expertise && { areasOfExpertise: { has: expertise } }),
      ...(language && { spokenLanguages: { has: language } }),
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { bio: { contains: search, mode: 'insensitive' } },
          { areasOfExpertise: { has: search } },
        ],
      }),
    };

    const [experts, total] = await Promise.all([
      prisma.expert.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, firstName: true, lastName: true, city: true, region: true,
          category: true, areasOfExpertise: true, spokenLanguages: true, bio: true,
          isVerified: true, avatarUrl: true, profileViews: true,
          reviews: { select: { rating: true } },
        },
      }),
      prisma.expert.count({ where }),
    ]);

    res.json({ experts, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    next(err);
  }
});

// Public: single expert profile
router.get('/:id', async (req, res, next) => {
  try {
    const expert = await prisma.expert.findUnique({
      where: { id: req.params.id },
      select: {
        id: true, firstName: true, lastName: true, city: true, region: true,
        country: true, category: true, areasOfExpertise: true, spokenLanguages: true, bio: true,
        isVerified: true, avatarUrl: true, createdAt: true,
        listings: {
          where: { isActive: true },
          select: { id: true, title: true, description: true, category: true, expertise: true, city: true, createdAt: true },
        },
        reviews: {
          orderBy: { createdAt: 'desc' },
          select: { id: true, clientName: true, rating: true, body: true, createdAt: true },
        },
      },
    });

    if (!expert) return res.status(404).json({ error: 'Expertul nu a fost găsit' });

    await prisma.$transaction([
      prisma.expert.update({ where: { id: req.params.id }, data: { profileViews: { increment: 1 } } }),
      prisma.analyticsEvent.create({ data: { expertId: req.params.id, type: 'PROFILE_VIEW' } }),
    ]);

    res.json({ expert });
  } catch (err) {
    next(err);
  }
});

// Public: track phone click
router.post('/:id/phone-click', async (req, res, next) => {
  try {
    await prisma.$transaction([
      prisma.expert.update({ where: { id: req.params.id }, data: { phoneClicks: { increment: 1 } } }),
      prisma.analyticsEvent.create({ data: { expertId: req.params.id, type: 'PHONE_CLICK' } }),
    ]);
    const expert = await prisma.expert.findUnique({ where: { id: req.params.id }, select: { phoneNumber: true } });
    res.json({ phoneNumber: expert?.phoneNumber });
  } catch (err) {
    next(err);
  }
});

// Private: update own profile
router.put('/me/profile', requireAuth, async (req, res, next) => {
  try {
    const { bio, city, region, category, areasOfExpertise, spokenLanguages, avatarUrl } = req.body;
    const expert = await prisma.expert.update({
      where: { id: req.expert.id },
      data: { bio, city, region, category, areasOfExpertise, spokenLanguages, avatarUrl },
      select: { id: true, bio: true, city: true, region: true, category: true, areasOfExpertise: true, spokenLanguages: true, avatarUrl: true },
    });
    res.json({ expert });
  } catch (err) {
    next(err);
  }
});

export default router;
