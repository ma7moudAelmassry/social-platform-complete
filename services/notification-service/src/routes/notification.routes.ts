import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller';

const router = Router();

router.get('/', notificationController.getNotifications);
router.get('/unread-count', notificationController.getUnreadCount);
router.patch('/:notificationId/read', notificationController.markAsRead);
router.patch('/read-all', notificationController.markAllAsRead);
router.post('/', notificationController.createNotification);

export default router;
