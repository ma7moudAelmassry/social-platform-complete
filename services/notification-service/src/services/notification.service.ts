import { Notification } from '../models/Notification';
import { logger } from '../utils/logger';

export class NotificationService {
  async createNotification(data: {
    recipientId: string;
    actorId: string;
    type: 'like' | 'comment' | 'follow' | 'mention' | 'message' | 'share';
    targetId?: string;
    targetType?: 'post' | 'comment' | 'user' | 'message';
  }) {
    const notification = await Notification.create(data);
    logger.info('Notification created', { 
      id: notification.id, 
      recipientId: data.recipientId,
      type: data.type 
    });
    return {
      id: notification._id.toString(),
      recipientId: notification.recipientId,
      actorId: notification.actorId,
      type: notification.type,
      targetId: notification.targetId,
      targetType: notification.targetType,
      read: notification.read,
      createdAt: notification.createdAt,
    };
  }

  async getNotifications(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      Notification.find({ recipientId: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments({ recipientId: userId }),
    ]);

    return {
      data: notifications.map((n) => ({
        id: n._id.toString(),
        recipientId: n.recipientId,
        actorId: n.actorId,
        type: n.type,
        targetId: n.targetId,
        targetType: n.targetType,
        read: n.read,
        createdAt: n.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        hasMore: skip + notifications.length < total,
      },
    };
  }

  async getUnreadCount(userId: string) {
    const count = await Notification.countDocuments({ 
      recipientId: userId, 
      read: false 
    });
    return count;
  }

  async markAsRead(notificationId: string, userId: string) {
    const result = await Notification.findOneAndUpdate(
      { _id: notificationId, recipientId: userId },
      { read: true },
      { new: true }
    );

    if (!result) {
      throw new Error('Notification not found');
    }

    logger.info('Notification marked as read', { notificationId, userId });
    return { success: true };
  }

  async markAllAsRead(userId: string) {
    await Notification.updateMany(
      { recipientId: userId, read: false },
      { read: true }
    );

    logger.info('All notifications marked as read', { userId });
    return { success: true };
  }

  async deleteNotification(notificationId: string, userId: string) {
    const result = await Notification.findOneAndDelete({
      _id: notificationId,
      recipientId: userId,
    });

    if (!result) {
      throw new Error('Notification not found');
    }

    logger.info('Notification deleted', { notificationId, userId });
    return { success: true };
  }
}

export const notificationService = new NotificationService();
