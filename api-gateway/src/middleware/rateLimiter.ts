import rateLimit from 'express-rate-limit';
import { config } from '../config';
import { logger } from '../utils/logger';

export const apiRateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    logger.warn('Rate limit exceeded', { ip: req.ip, path: req.path });
    res.status(options.statusCode).json(options.message);
  },
});

export const strictRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per window
  message: {
    success: false,
    message: 'Too many requests for this endpoint.',
  },
});
