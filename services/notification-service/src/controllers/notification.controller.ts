import { Request, Response, NextFunction } from 'express';
import { notificationService } from '../services/notification.service';

export class NotificationController {
  async getNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.headers['x-user-id'] as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await notificationService.getNotifications(userId, page, limit);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getUnreadCount(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.headers['x-user-id'] as string;
      const count = await notificationService.getUnreadCount(userId);
      res.json({ success: true, data: { count } });
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.headers['x-user-id'] as string;
      const { notificationId } = req.params;
      const result = await notificationService.markAsRead(notificationId, userId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.headers['x-user-id'] as string;
      const result = await notificationService.markAllAsRead(userId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async createNotification(req: Request, res: Response, next: NextFunction) {
    try {
      const notification = await notificationService.createNotification(req.body);
      res.status(201).json({ success: true, data: notification });
    } catch (error) {
      next(error);
    }
  }
}

export const notificationController = new NotificationController();
