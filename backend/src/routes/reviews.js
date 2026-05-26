import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../utils/prisma.js';

const router = Router();

const validate = [
  body('clientName').trim().notEmpty(),
  body('rating').isInt({ min: 1, max: 5 }),
  body('body').trim().isLength({ min: 10 }),
];

router.post('/listing/:listingId', validate, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    const listing = await prisma.listing.findUnique({ where: { id: req.params.listingId } });
    if (!listing) return res.status(404).json({ error: 'Anunț negăsit' });

    const { clientName, clientEmail, rating, body: reviewBody } = req.body;

    const review = await prisma.review.create({
      data: {
        listingId: req.params.listingId,
        expertId: listing.expertId,
        clientName,
        clientEmail,
        rating: Number(rating),
        body: reviewBody,
      },
    });

    res.status(201).json({ review });
  } catch (err) {
    next(err);
  }
});

router.get('/expert/:expertId', async (req, res, next) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { expertId: req.params.expertId },
      orderBy: { createdAt: 'desc' },
    });
    const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
    res.json({ reviews, average: Math.round(avg * 10) / 10, total: reviews.length });
  } catch (err) {
    next(err);
  }
});

export default router;
