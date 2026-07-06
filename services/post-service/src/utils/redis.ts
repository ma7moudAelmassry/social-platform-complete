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

export const cachePost = async (postId: string, postData: any, ttl: number = 3600) => {
  await redis.setex(`post:${postId}`, ttl, JSON.stringify(postData));
};

export const getCachedPost = async (postId: string): Promise<any | null> => {
  const data = await redis.get(`post:${postId}`);
  return data ? JSON.parse(data) : null;
};

export const invalidatePostCache = async (postId: string) => {
  await redis.del(`post:${postId}`);
};

export const cacheFeed = async (userId: string, feed: any[], ttl: number = 300) => {
  await redis.setex(`feed:${userId}`, ttl, JSON.stringify(feed));
};

export const getCachedFeed = async (userId: string): Promise<any[] | null> => {
  const data = await redis.get(`feed:${userId}`);
  return data ? JSON.parse(data) : null;
};
