import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { config } from './config';
import { connectDB } from './utils/mongoose';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { setupSocketHandlers } from './websocket/socket.handler';
import chatRoutes from './routes/chat.routes';

const app = express();
const httpServer = createServer(app);

// Setup Socket.IO
const io = new SocketServer(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
});

setupSocketHandlers(io);

app.use(helmet());
app.use(cors());
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'chat-service', timestamp: new Date().toISOString() });
});

// Routes
app.use('/chat', chatRoutes);

// Error handling
app.use(errorHandler);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Connect to DB and start server
connectDB().then(() => {
  const PORT = config.port;
  httpServer.listen(PORT, () => {
    logger.info(`Chat Service running on port ${PORT}`);
    logger.info(`Socket.IO ready for connections`);
  });
});

export default app;
