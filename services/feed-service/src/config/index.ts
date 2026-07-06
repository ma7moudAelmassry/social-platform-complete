import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3003'),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/social_posts',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  userServiceUrl: process.env.USER_SERVICE_URL || 'http://localhost:3001',
  postServiceUrl: process.env.POST_SERVICE_URL || 'http://localhost:3002',
};
