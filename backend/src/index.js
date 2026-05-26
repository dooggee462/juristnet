import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server as SocketIO } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import juristRoutes from './routes/jurists.js';
import listingRoutes from './routes/listings.js';
import reviewRoutes from './routes/reviews.js';
import messageRoutes from './routes/messages.js';
import stripeRoutes from './routes/stripe.js';
import analyticsRoutes from './routes/analytics.js';
import uploadRoutes from './routes/upload.js';
import chatRoutes from './routes/chat.js';
import { errorHandler } from './middleware/errorHandler.js';
import { initSocket } from './socket/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 4000;
const isProd = process.env.NODE_ENV === 'production';

const allowedOrigins = process.env.CLIENT_URL
  ? [process.env.CLIENT_URL]
  : ['http://localhost:5173'];

const io = new SocketIO(httpServer, {
  cors: { origin: allowedOrigins, methods: ['GET', 'POST'], credentials: true },
  transports: ['websocket', 'polling'],
});

initSocket(io);

app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan(isProd ? 'combined' : 'dev'));
app.use(cors({ origin: allowedOrigins, credentials: true }));

app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use(limiter);

// Serve uploaded avatars
const uploadsDir = path.join(__dirname, '../../uploads');
app.use('/uploads', express.static(uploadsDir));

app.use('/api/auth', authRoutes);
app.use('/api/jurists', juristRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/chat', chatRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.use(errorHandler);

if (isProd) {
  const staticPath = path.join(__dirname, '../../frontend/dist');
  app.use(express.static(staticPath));
  app.get('*', (_req, res) => res.sendFile(path.join(staticPath, 'index.html')));
}

httpServer.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
