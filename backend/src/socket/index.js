import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma.js';

export function initSocket(io) {
  // Middleware: identify expert (JWT) or client (email/name)
  io.use((socket, next) => {
    const { token, clientEmail, clientName } = socket.handshake.auth;
    if (token) {
      try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        socket.expertId = payload.id;
        socket.role = 'expert';
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
    // Expert: join all their conversation rooms automatically
    if (socket.role === 'expert') {
      const convs = await prisma.conversation.findMany({
        where: { expertId: socket.expertId },
        select: { id: true },
      });
      convs.forEach((c) => socket.join(`conv_${c.id}`));
    }

    // Join a specific conversation room
    socket.on('join_conversation', async ({ conversationId }) => {
      const conv = await prisma.conversation.findUnique({ where: { id: conversationId } });
      if (!conv) return;

      if (socket.role === 'expert' && conv.expertId !== socket.expertId) return;
      if (socket.role === 'client' && conv.clientEmail !== socket.clientEmail) return;

      socket.join(`conv_${conversationId}`);
      socket.emit('joined', { conversationId });
    });

    // Send message
    socket.on('send_message', async ({ conversationId, body }) => {
      if (!body?.trim() || !conversationId) return;

      const conv = await prisma.conversation.findUnique({ where: { id: conversationId } });
      if (!conv) return;

      if (socket.role === 'expert' && conv.expertId !== socket.expertId) return;
      if (socket.role === 'client' && conv.clientEmail !== socket.clientEmail) return;

      const senderType = socket.role === 'expert' ? 'EXPERT' : 'CLIENT';

      let senderName = socket.clientName || '';
      if (socket.role === 'expert') {
        const e = await prisma.expert.findUnique({ where: { id: socket.expertId }, select: { firstName: true, lastName: true } });
        senderName = e ? `${e.firstName} ${e.lastName}` : '';
      }

      const msg = await prisma.chatMessage.create({
        data: { conversationId, senderType, senderName, body: body.trim() },
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
