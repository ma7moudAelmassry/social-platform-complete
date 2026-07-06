import { Router } from 'express';
import { feedController } from '../controllers/feed.controller';

const router = Router();

router.get('/', feedController.getFeed);
router.get('/explore', feedController.getExplore);
router.get('/search', feedController.search);
router.get('/trending', feedController.getTrending);

export default router;
