import { Router } from 'express';
import { postController } from '../controllers/post.controller';

const router = Router();

// Posts
router.post('/', postController.createPost);
router.get('/search', postController.searchPosts);
router.get('/trending', postController.getTrendingHashtags);
router.get('/:postId', postController.getPost);
router.delete('/:postId', postController.deletePost);
router.post('/:postId/like', postController.likePost);
router.delete('/:postId/like', postController.unlikePost);
router.post('/:postId/save', postController.savePost);

// Comments
router.get('/:postId/comments', postController.getComments);
router.post('/:postId/comments', postController.createComment);
router.delete('/:postId/comments/:commentId', postController.deleteComment);

export default router;
