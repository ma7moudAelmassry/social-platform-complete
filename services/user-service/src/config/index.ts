import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001'),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/social_platform',
  jwtSecret: process.env.JWT_SECRET || 'default-secret',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
  mediaServiceUrl: process.env.MEDIA_SERVICE_URL || 'http://localhost:3006',
};
