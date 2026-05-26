import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import prisma from '../utils/prisma.js';

const router = Router();

const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('firstName').trim().notEmpty(),
  body('lastName').trim().notEmpty(),
  body('country').trim().notEmpty(),
  body('postalCode').trim().notEmpty(),
  body('streetAddress').trim().notEmpty(),
  body('phoneNumber').trim().notEmpty(),
];

router.post('/register', registerValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { email, password, firstName, lastName, country, postalCode, streetAddress, phoneNumber } = req.body;

    const existing = await prisma.jurist.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Email deja înregistrat' });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const jurist = await prisma.jurist.create({
      data: { email, passwordHash, firstName, lastName, country, postalCode, streetAddress, phoneNumber },
      select: { id: true, email: true, firstName: true, lastName: true, isVerified: true, subStatus: true },
    });

    const token = jwt.sign({ id: jurist.id, email: jurist.email }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ token, jurist });
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email și parola sunt obligatorii' });
    }

    const jurist = await prisma.jurist.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!jurist) {
      return res.status(401).json({ error: 'Credențiale invalide' });
    }

    const valid = await bcrypt.compare(password, jurist.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Credențiale invalide' });
    }

    const token = jwt.sign({ id: jurist.id, email: jurist.email }, process.env.JWT_SECRET, { expiresIn: '7d' });

    const { passwordHash: _, ...juristData } = jurist;
    res.json({ token, jurist: juristData });
  } catch (err) {
    next(err);
  }
});

router.get('/me', async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'Neautorizat' });

    const payload = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
    const jurist = await prisma.jurist.findUnique({
      where: { id: payload.id },
      select: { id: true, email: true, firstName: true, lastName: true, isVerified: true, subStatus: true, subCurrentEnd: true, avatarUrl: true, city: true, region: true, areasOfExpertise: true, spokenLanguages: true, bio: true },
    });
    if (!jurist) return res.status(404).json({ error: 'Nu există' });
    res.json({ jurist });
  } catch {
    res.status(401).json({ error: 'Token invalid' });
  }
});

export default router;
