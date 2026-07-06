import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('User service error', { 
    error: err.message, 
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  if (err.code === 'P2002') {
    return res.status(409).json({
      success: false,
      message: 'Resource already exists',
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Resource not found',
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
};
