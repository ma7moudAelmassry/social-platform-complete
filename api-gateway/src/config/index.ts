import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '8080'),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'default-secret',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret',
  services: {
    user: process.env.USER_SERVICE_URL || 'http://localhost:3001',
    post: process.env.POST_SERVICE_URL || 'http://localhost:3002',
    feed: process.env.FEED_SERVICE_URL || 'http://localhost:3003',
    chat: process.env.CHAT_SERVICE_URL || 'http://localhost:3004',
    notification: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3005',
    media: process.env.MEDIA_SERVICE_URL || 'http://localhost:3006',
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  },
};
