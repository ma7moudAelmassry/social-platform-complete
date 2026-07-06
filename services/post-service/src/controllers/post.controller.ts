import { Request, Response, NextFunction } from 'express';
import { postService } from '../services/post.service';

export class PostController {
  async createPost(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.headers['x-user-id'] as string;
      const { content, hashtags, mentions } = req.body;

      // Parse media from uploaded files
      const media = req.files ? (req.files as any[]).map((file) => ({
        url: `/uploads/${file.filename}`,
        type: file.mimetype.startsWith('video') ? 'video' : 'image',
      })) : [];

      const post = await postService.createPost({
        authorId: userId,
        content,
        media,
        hashtags,
        mentions,
      });

      res.status(201).json({
        success: true,
        data: { ...post.toObject(), id: post._id.toString() },
        message: 'Post created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getPost(req: Request, res: Response, next: NextFunction) {
    try {
      const { postId } = req.params;
      const userId = req.headers['x-user-id'] as string;
      const post = await postService.getPost(postId, userId);
      res.json({ success: true, data: post });
    } catch (error) {
      next(error);
    }
  }

  async getUserPosts(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const result = await postService.getUserPosts(userId, page, limit);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async deletePost(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.headers['x-user-id'] as string;
      const { postId } = req.params;
      const result = await postService.deletePost(postId, userId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async likePost(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.headers['x-user-id'] as string;
      const { postId } = req.params;
      const result = await postService.likePost(postId, userId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async unlikePost(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.headers['x-user-id'] as string;
      const { postId } = req.params;
      const result = await postService.unlikePost(postId, userId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async savePost(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.headers['x-user-id'] as string;
      const { postId } = req.params;
      const result = await postService.savePost(postId, userId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getComments(req: Request, res: Response, next: NextFunction) {
    try {
      const { postId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await postService.getComments(postId, page, limit);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async createComment(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.headers['x-user-id'] as string;
      const { postId } = req.params;
      const { content } = req.body;
      const comment = await postService.createComment(postId, userId, content);
      res.status(201).json({
        success: true,
        data: { ...comment.toObject(), id: comment._id.toString() },
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteComment(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.headers['x-user-id'] as string;
      const { commentId } = req.params;
      const result = await postService.deleteComment(commentId, userId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async searchPosts(req: Request, res: Response, next: NextFunction) {
    try {
      const { q } = req.query;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await postService.searchPosts(q as string, page, limit);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getTrendingHashtags(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const result = await postService.getTrendingHashtags(limit);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

export const postController = new PostController();
