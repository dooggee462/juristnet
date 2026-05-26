import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../utils/prisma.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Client: start or get conversation with jurist
router.post('/start', [
  body('juristId').notEmpty(),
  body('clientName').trim().notEmpty(),
  body('clientEmail').isEmail().normalizeEmail(),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    const { juristId, clientName, clientEmail } = req.body;

    const conversation = await prisma.conversation.upsert({
      where: { juristId_clientEmail: { juristId, clientEmail } },
      update: {},
      create: { juristId, clientName, clientEmail },
      include: {
        jurist: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, isVerified: true } },
        chatMessages: { orderBy: { createdAt: 'asc' }, take: 50 },
      },
    });

    res.json({ conversation });
  } catch (err) {
    next(err);
  }
});

// Client: get conversation by id + history
router.get('/:id', async (req, res, next) => {
  try {
    const conv = await prisma.conversation.findUnique({
      where: { id: req.params.id },
      include: {
        jurist: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, isVerified: true } },
        chatMessages: { orderBy: { createdAt: 'asc' } },
      },
    });
    if (!conv) return res.status(404).json({ error: 'Conversație negăsită' });
    res.json({ conversation: conv });
  } catch (err) {
    next(err);
  }
});

// Jurist: list all conversations
router.get('/jurist/inbox', requireAuth, async (req, res, next) => {
  try {
    const conversations = await prisma.conversation.findMany({
      where: { juristId: req.jurist.id },
      orderBy: { lastAt: { sort: 'desc', nulls: 'last' } },
      include: {
        chatMessages: { orderBy: { createdAt: 'desc' }, take: 1 },
        _count: { select: { chatMessages: true } },
      },
    });
    res.json({ conversations });
  } catch (err) {
    next(err);
  }
});

export default router;
