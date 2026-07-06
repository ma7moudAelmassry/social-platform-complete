import { Router } from 'express';
import { chatController } from '../controllers/chat.controller';

const router = Router();

router.get('/rooms', chatController.getRooms);
router.post('/rooms', chatController.createRoom);
router.get('/rooms/:roomId/messages', chatController.getMessages);
router.patch('/rooms/:roomId/read', chatController.markAsRead);

export default router;
