import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { requireAuth } from '../middleware/auth.js';
import prisma from '../utils/prisma.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, '../../../uploads');

if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `avatar_${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Doar imagini JPG, PNG sau WEBP sunt acceptate'));
  },
});

const router = Router();

router.post('/avatar', requireAuth, upload.single('avatar'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Niciun fișier uploadat' });

    const avatarUrl = `/uploads/${req.file.filename}`;

    const old = await prisma.expert.findUnique({ where: { id: req.expert.id }, select: { avatarUrl: true } });
    if (old?.avatarUrl && old.avatarUrl.startsWith('/uploads/')) {
      const oldPath = path.join(uploadDir, path.basename(old.avatarUrl));
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    await prisma.expert.update({ where: { id: req.expert.id }, data: { avatarUrl } });

    res.json({ avatarUrl });
  } catch (err) {
    next(err);
  }
});

export default router;
