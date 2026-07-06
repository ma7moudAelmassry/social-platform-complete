import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { config } from './config';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import mediaRoutes from './routes/media.routes';

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
app.use(express.json({ limit: '50mb' }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.resolve(config.localStoragePath)));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'media-service',
    timestamp: new Date().toISOString(),
    storage: config.useLocalStorage ? 'local' : 's3',
  });
});

// Routes
app.use('/media', mediaRoutes);

// Error handling
app.use(errorHandler);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

const PORT = config.port;
app.listen(PORT, () => {
  logger.info(`Media Service running on port ${PORT}`);
  logger.info(`Storage mode: ${config.useLocalStorage ? 'local' : 's3'}`);
});

export default app;
