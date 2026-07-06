import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error('Feed service error', { error: err.message, path: req.path });
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
};
