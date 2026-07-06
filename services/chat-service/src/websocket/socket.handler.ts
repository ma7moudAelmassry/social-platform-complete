import { Server as SocketServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { chatService } from '../services/chat.service';
import { logger } from '../utils/logger';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

export const setupSocketHandlers = (io: SocketServer) => {
  // Authentication middleware
  io.use((socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token as string, config.jwtSecret) as any;
      socket.userId = decoded.id;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    const userId = socket.userId;
    logger.info(`User connected: ${userId}`, { socketId: socket.id });

    // Join user's personal room for notifications
    socket.join(`user:${userId}`);

    // Handle joining a chat room
    socket.on('chat:join', async ({ roomId }: { roomId: string }) => {
      socket.join(roomId);
      logger.info(`User ${userId} joined room ${roomId}`);

      // Mark messages as read
      await chatService.markMessagesAsRead(roomId, userId!);
    });

    // Handle leaving a chat room
    socket.on('chat:leave', ({ roomId }: { roomId: string }) => {
      socket.leave(roomId);
      logger.info(`User ${userId} left room ${roomId}`);
    });

    // Handle sending a message
    socket.on('chat:message', async (data: { roomId: string; content: string; mediaUrl?: string }) => {
      try {
        const message = await chatService.sendMessage(
          data.roomId,
          userId!,
          data.content,
          data.mediaUrl
        );

        // Broadcast to room
        io.to(data.roomId).emit('chat:new_message', message);

        // Notify other participant
        const room = await chatService.getOrCreateRoom([userId!, '']); // Get actual participants
        // In real implementation, get participants from room and notify
      } catch (error) {
        logger.error('Error sending message', { error, userId });
        socket.emit('chat:error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicator
    socket.on('chat:typing', ({ roomId }: { roomId: string }) => {
      socket.to(roomId).emit('chat:typing', { roomId, userId });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${userId}`, { socketId: socket.id });
    });
  });
};
