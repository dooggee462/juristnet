import { Router } from 'express';
import prisma from '../utils/prisma.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/dashboard', requireAuth, async (req, res, next) => {
  try {
    const juristId = req.jurist.id;

    const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [jurist, events30d, totalReviews, listings, unreadMessages] = await Promise.all([
      prisma.jurist.findUnique({
        where: { id: juristId },
        select: { profileViews: true, phoneClicks: true, subStatus: true, subCurrentEnd: true, isVerified: true },
      }),
      prisma.analyticsEvent.groupBy({
        by: ['type'],
        where: { juristId, createdAt: { gte: since30d } },
        _count: { type: true },
      }),
      prisma.review.aggregate({
        where: { juristId },
        _avg: { rating: true },
        _count: { id: true },
      }),
      prisma.listing.findMany({
        where: { juristId },
        select: { id: true, title: true, isActive: true, createdAt: true, _count: { select: { reviews: true } } },
      }),
      prisma.message.count({ where: { juristId, isRead: false } }),
    ]);

    const eventMap = Object.fromEntries(events30d.map((e) => [e.type, e._count.type]));

    res.json({
      stats: {
        totalProfileViews: jurist?.profileViews ?? 0,
        totalPhoneClicks: jurist?.phoneClicks ?? 0,
        views30d: eventMap['PROFILE_VIEW'] ?? 0,
        phoneClicks30d: eventMap['PHONE_CLICK'] ?? 0,
        messages30d: eventMap['MESSAGE_SENT'] ?? 0,
      },
      subscription: {
        status: jurist?.subStatus,
        currentEnd: jurist?.subCurrentEnd,
      },
      reviews: {
        average: totalReviews._avg.rating ?? 0,
        total: totalReviews._count.id,
      },
      listings,
      unreadMessages,
      isVerified: jurist?.isVerified,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
