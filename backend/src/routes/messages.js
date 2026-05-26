import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../utils/prisma.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const validate = [
  body('senderName').trim().notEmpty(),
  body('senderEmail').isEmail().normalizeEmail(),
  body('subject').trim().notEmpty(),
  body('body').trim().isLength({ min: 10 }),
];

// Public: client sends message to jurist
router.post('/jurist/:juristId', validate, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    const jurist = await prisma.jurist.findUnique({ where: { id: req.params.juristId }, select: { id: true, isActive: true } });
    if (!jurist?.isActive) return res.status(404).json({ error: 'Juristul nu este disponibil' });

    const { senderName, senderEmail, subject, body: msgBody } = req.body;

    const message = await prisma.message.create({
      data: { juristId: req.params.juristId, senderName, senderEmail, subject, body: msgBody },
    });

    await prisma.analyticsEvent.create({ data: { juristId: req.params.juristId, type: 'MESSAGE_SENT' } });

    res.status(201).json({ message: 'Mesaj trimis cu succes', id: message.id });
  } catch (err) {
    next(err);
  }
});

// Private: jurist fetches own inbox
router.get('/inbox', requireAuth, async (req, res, next) => {
  try {
    const messages = await prisma.message.findMany({
      where: { juristId: req.jurist.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ messages });
  } catch (err) {
    next(err);
  }
});

// Private: mark message as read
router.patch('/:id/read', requireAuth, async (req, res, next) => {
  try {
    const msg = await prisma.message.findUnique({ where: { id: req.params.id } });
    if (!msg || msg.juristId !== req.jurist.id) return res.status(403).json({ error: 'Acces interzis' });
    await prisma.message.update({ where: { id: req.params.id }, data: { isRead: true } });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
