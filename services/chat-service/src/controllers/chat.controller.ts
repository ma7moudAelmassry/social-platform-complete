import { Request, Response, NextFunction } from 'express';
import { chatService } from '../services/chat.service';

export class ChatController {
  async getRooms(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.headers['x-user-id'] as string;
      const rooms = await chatService.getRooms(userId);
      res.json({ success: true, data: rooms });
    } catch (error) {
      next(error);
    }
  }

  async getMessages(req: Request, res: Response, next: NextFunction) {
    try {
      const { roomId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const result = await chatService.getMessages(roomId, page, limit);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async createRoom(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.headers['x-user-id'] as string;
      const { participantId } = req.body;
      const room = await chatService.getOrCreateRoom([userId, participantId]);
      res.status(201).json({
        success: true,
        data: {
          id: room._id.toString(),
          participants: room.participants.filter((id) => id !== userId),
          createdAt: room.createdAt,
          updatedAt: room.updatedAt,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.headers['x-user-id'] as string;
      const { roomId } = req.params;
      const result = await chatService.markMessagesAsRead(roomId, userId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

export const chatController = new ChatController();
