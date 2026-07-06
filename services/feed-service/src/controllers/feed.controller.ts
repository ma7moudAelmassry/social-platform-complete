import { Request, Response, NextFunction } from 'express';
import { feedService } from '../services/feed.service';

export class FeedController {
  async getFeed(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.headers['x-user-id'] as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const result = await feedService.getFeed(userId, page, limit);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getExplore(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const result = await feedService.getExploreFeed(page, limit);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async search(req: Request, res: Response, next: NextFunction) {
    try {
      const { q, type } = req.query;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await feedService.search(q as string, type as string, page, limit);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getTrending(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const result = await feedService.getTrendingTopics(limit);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

export const feedController = new FeedController();
