import { Router } from 'express';
import prisma from '../utils/prisma.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Public: list/search jurists
router.get('/', async (req, res, next) => {
  try {
    const { expertise, city, language, search, page = 1, limit = 12 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = {
      isActive: true,
      subStatus: 'ACTIVE',
      ...(city && { city: { contains: city, mode: 'insensitive' } }),
      ...(expertise && { areasOfExpertise: { has: expertise } }),
      ...(language && { spokenLanguages: { has: language } }),
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { bio: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [jurists, total] = await Promise.all([
      prisma.jurist.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, firstName: true, lastName: true, city: true, region: true,
          areasOfExpertise: true, spokenLanguages: true, bio: true,
          isVerified: true, avatarUrl: true, profileViews: true,
          reviews: { select: { rating: true } },
        },
      }),
      prisma.jurist.count({ where }),
    ]);

    res.json({ jurists, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    next(err);
  }
});

// Public: single jurist profile
router.get('/:id', async (req, res, next) => {
  try {
    const jurist = await prisma.jurist.findUnique({
      where: { id: req.params.id },
      select: {
        id: true, firstName: true, lastName: true, city: true, region: true,
        country: true, areasOfExpertise: true, spokenLanguages: true, bio: true,
        isVerified: true, avatarUrl: true, createdAt: true,
        listings: {
          where: { isActive: true },
          select: { id: true, title: true, description: true, expertise: true, city: true, createdAt: true },
        },
        reviews: {
          orderBy: { createdAt: 'desc' },
          select: { id: true, clientName: true, rating: true, body: true, createdAt: true },
        },
      },
    });

    if (!jurist) return res.status(404).json({ error: 'Juristul nu a fost găsit' });

    // Track profile view
    await prisma.$transaction([
      prisma.jurist.update({ where: { id: req.params.id }, data: { profileViews: { increment: 1 } } }),
      prisma.analyticsEvent.create({ data: { juristId: req.params.id, type: 'PROFILE_VIEW' } }),
    ]);

    res.json({ jurist });
  } catch (err) {
    next(err);
  }
});

// Private: track phone click
router.post('/:id/phone-click', async (req, res, next) => {
  try {
    await prisma.$transaction([
      prisma.jurist.update({ where: { id: req.params.id }, data: { phoneClicks: { increment: 1 } } }),
      prisma.analyticsEvent.create({ data: { juristId: req.params.id, type: 'PHONE_CLICK' } }),
    ]);
    const jurist = await prisma.jurist.findUnique({ where: { id: req.params.id }, select: { phoneNumber: true } });
    res.json({ phoneNumber: jurist?.phoneNumber });
  } catch (err) {
    next(err);
  }
});

// Private: update own profile
router.put('/me/profile', requireAuth, async (req, res, next) => {
  try {
    const { bio, city, region, areasOfExpertise, spokenLanguages, avatarUrl } = req.body;
    const jurist = await prisma.jurist.update({
      where: { id: req.jurist.id },
      data: { bio, city, region, areasOfExpertise, spokenLanguages, avatarUrl },
      select: { id: true, bio: true, city: true, region: true, areasOfExpertise: true, spokenLanguages: true, avatarUrl: true },
    });
    res.json({ jurist });
  } catch (err) {
    next(err);
  }
});

export default router;
