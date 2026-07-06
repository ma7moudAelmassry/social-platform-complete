import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config';
import { connectDB } from './utils/mongoose';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import postRoutes from './routes/post.routes';

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'post-service', timestamp: new Date().toISOString() });
});

// Routes
app.use('/posts', postRoutes);

// Error handling
app.use(errorHandler);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Connect to DB and start server
connectDB().then(() => {
  const PORT = config.port;
  app.listen(PORT, () => {
    logger.info(`Post Service running on port ${PORT}`);
  });
});

export default app;
