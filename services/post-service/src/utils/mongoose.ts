import mongoose from 'mongoose';
import { config } from '../config';
import { logger } from './logger';

export const connectDB = async () => {
  try {
    await mongoose.connect(config.mongodbUri);
    logger.info('MongoDB connected');
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

mongoose.connection.on('error', (err) => {
  logger.error('MongoDB error:', err);
});

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
});
