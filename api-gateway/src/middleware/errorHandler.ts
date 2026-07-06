import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('Gateway error', { error: err.message, stack: err.stack, path: req.path });

  if (err.code === 'ECONNREFUSED') {
    return res.status(503).json({
      success: false,
      message: 'Service temporarily unavailable',
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
};
