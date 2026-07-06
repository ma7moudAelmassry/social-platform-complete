import Redis from 'ioredis';
import { config } from '../config';
import { logger } from './logger';

export const redis = new Redis(config.redisUrl, {
  retryStrategy: (times) => {
    if (times > 10) {
      logger.error('Redis connection failed after 10 retries');
      return null;
    }
    return Math.min(times * 100, 3000);
  },
});

redis.on('connect', () => logger.info('Redis connected'));
redis.on('error', (err) => logger.error('Redis error:', err));

export const cacheUser = async (userId: string, userData: any, ttl: number = 3600) => {
  await redis.setex(`user:${userId}`, ttl, JSON.stringify(userData));
};

export const getCachedUser = async (userId: string): Promise<any | null> => {
  const data = await redis.get(`user:${userId}`);
  return data ? JSON.parse(data) : null;
};

export const invalidateUserCache = async (userId: string) => {
  await redis.del(`user:${userId}`);
};
