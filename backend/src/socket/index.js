import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma.js';

export function initSocket(io) {
  // Middleware: identify jurist (JWT) or client (email/name)
  io.use((socket, next) => {
    const { token, clientEmail, clientName } = socket.handshake.auth;
    if (token) {
      try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        socket.juristId = payload.id;
        socket.role = 'jurist';
        return next();
      } catch {
        return next(new Error('Token invalid'));
      }
    }
    if (clientEmail && clientName) {
      socket.clientEmail = clientEmail;
      socket.clientName = clientName;
      socket.role = 'client';
      return next();
    }
    next(new Error('Autentificare necesară'));
  });

  io.on('connection', async (socket) => {
    // Jurist: join all their conversation rooms automatically
    if (socket.role === 'jurist') {
      const convs = await prisma.conversation.findMany({
        where: { juristId: socket.juristId },
        select: { id: true },
      });
      convs.forEach((c) => socket.join(`conv_${c.id}`));
    }

    // Join a specific conversation room
    socket.on('join_conversation', async ({ conversationId }) => {
      const conv = await prisma.conversation.findUnique({ where: { id: conversationId } });
      if (!conv) return;

      // Validate access
      if (socket.role === 'jurist' && conv.juristId !== socket.juristId) return;
      if (socket.role === 'client' && conv.clientEmail !== socket.clientEmail) return;

      socket.join(`conv_${conversationId}`);
      socket.emit('joined', { conversationId });
    });

    // Send message
    socket.on('send_message', async ({ conversationId, body }) => {
      if (!body?.trim() || !conversationId) return;

      const conv = await prisma.conversation.findUnique({ where: { id: conversationId } });
      if (!conv) return;

      // Validate access
      if (socket.role === 'jurist' && conv.juristId !== socket.juristId) return;
      if (socket.role === 'client' && conv.clientEmail !== socket.clientEmail) return;

      const senderType = socket.role === 'jurist' ? 'JURIST' : 'CLIENT';
      const senderName = socket.role === 'jurist'
        ? (await prisma.jurist.findUnique({ where: { id: socket.juristId }, select: { firstName: true, lastName: true } })).then
          ? '' : ''
        : socket.clientName;

      let juristName = '';
      if (socket.role === 'jurist') {
        const j = await prisma.jurist.findUnique({ where: { id: socket.juristId }, select: { firstName: true, lastName: true } });
        juristName = `${j.firstName} ${j.lastName}`;
      }

      const msg = await prisma.chatMessage.create({
        data: {
          conversationId,
          senderType,
          senderName: socket.role === 'jurist' ? juristName : socket.clientName,
          body: body.trim(),
        },
      });

      await prisma.conversation.update({
        where: { id: conversationId },
        data: { lastMessage: body.trim(), lastAt: new Date() },
      });

      io.to(`conv_${conversationId}`).emit('new_message', msg);
    });

    socket.on('disconnect', () => {});
  });
}
