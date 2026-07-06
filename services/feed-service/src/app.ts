import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import feedRoutes from './routes/feed.routes';

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'feed-service', timestamp: new Date().toISOString() });
});

// Routes
app.use('/feed', feedRoutes);
app.use('/search', feedRoutes);

// Error handling
app.use(errorHandler);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

const PORT = config.port;
app.listen(PORT, () => {
  logger.info(`Feed Service running on port ${PORT}`);
});

export default app;
