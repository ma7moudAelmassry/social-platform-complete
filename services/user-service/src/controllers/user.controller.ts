import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/user.service';

export class UserController {
  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.headers['x-user-id'] as string;
      const user = await userService.getUserById(userId);
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async getUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { username } = req.params;
      const currentUserId = req.headers['x-user-id'] as string;
      const user = await userService.getUserByUsername(username, currentUserId);
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.headers['x-user-id'] as string;
      const updateData: any = {};

      if (req.body.displayName) updateData.displayName = req.body.displayName;
      if (req.body.bio !== undefined) updateData.bio = req.body.bio;
      if (req.body.location !== undefined) updateData.location = req.body.location;
      if (req.body.website !== undefined) updateData.website = req.body.website;

      // Handle avatar upload - in production, send to media service
      if (req.file) {
        // For now, store a placeholder - in real app, upload to S3/Media service
        updateData.avatar = `/uploads/avatars/${userId}`;
      }

      const user = await userService.updateProfile(userId, updateData);
      res.json({ success: true, data: user, message: 'Profile updated' });
    } catch (error) {
      next(error);
    }
  }

  async followUser(req: Request, res: Response, next: NextFunction) {
    try {
      const followerId = req.headers['x-user-id'] as string;
      const { userId } = req.params;
      const result = await userService.followUser(followerId, userId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async unfollowUser(req: Request, res: Response, next: NextFunction) {
    try {
      const followerId = req.headers['x-user-id'] as string;
      const { userId } = req.params;
      const result = await userService.unfollowUser(followerId, userId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getFollowers(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await userService.getFollowers(userId, page, limit);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getFollowing(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await userService.getFollowing(userId, page, limit);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async searchUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const { q } = req.query;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await userService.searchUsers(q as string, page, limit);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
