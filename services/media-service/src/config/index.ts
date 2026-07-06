import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3006'),
  nodeEnv: process.env.NODE_ENV || 'development',
  useLocalStorage: process.env.USE_LOCAL_STORAGE === 'true',
  localStoragePath: process.env.LOCAL_STORAGE_PATH || './uploads',
  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    bucketName: process.env.S3_BUCKET_NAME || 'social-platform-media',
    endpoint: process.env.S3_ENDPOINT,
  },
};
