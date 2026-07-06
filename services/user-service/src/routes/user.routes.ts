import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { uploadAvatar } from '../middleware/upload';

const router = Router();

router.get('/me', userController.getMe);
router.patch('/me', uploadAvatar, userController.updateProfile);
router.get('/search', userController.searchUsers);
router.get('/:username', userController.getUser);
router.post('/:userId/follow', userController.followUser);
router.delete('/:userId/follow', userController.unfollowUser);
router.get('/:userId/followers', userController.getFollowers);
router.get('/:userId/following', userController.getFollowing);

export default router;
