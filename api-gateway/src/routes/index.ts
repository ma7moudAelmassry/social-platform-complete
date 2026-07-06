import { Router } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { config } from '../config';
import { authenticateToken, optionalAuth } from '../middleware/auth';
import { strictRateLimiter } from '../middleware/rateLimiter';

const router = Router();

// Service proxy options
const createServiceProxy = (target: string, pathRewrite?: { [key: string]: string }) => {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite,
    on: {
      error: (err, req, res) => {
        console.error(`Proxy error for ${target}:`, err.message);
        const response = res as import('http').ServerResponse;
        if (!response.headersSent) {
          response.writeHead(503, { 'Content-Type': 'application/json' });
        }
        response.end(JSON.stringify({ success: false, message: 'Service unavailable' }));
      },
      proxyReq: (proxyReq, req: any) => {
        // Forward user info from JWT if available
        if (req.user) {
          proxyReq.setHeader('x-user-id', req.user.id);
          proxyReq.setHeader('x-user-username', req.user.username);
          proxyReq.setHeader('x-user-email', req.user.email);
        }
      },
    },
  });
};

// Auth routes (public)
router.use('/auth', createServiceProxy(config.services.user, { '^/api/auth': '/auth' }));

// User routes (protected)
router.use('/users', authenticateToken, createServiceProxy(config.services.user, { '^/api/users': '/users' }));

// Post routes (mixed)
router.use('/posts', optionalAuth, createServiceProxy(config.services.post, { '^/api/posts': '/posts' }));

// Feed routes (protected)
router.use('/feed', authenticateToken, createServiceProxy(config.services.feed, { '^/api/feed': '/feed' }));

// Chat routes (protected)
router.use('/chat', authenticateToken, createServiceProxy(config.services.chat, { '^/api/chat': '/chat' }));

// Notification routes (protected)
router.use('/notifications', authenticateToken, createServiceProxy(config.services.notification, { '^/api/notifications': '/notifications' }));

// Media routes (mixed)
router.use('/media', optionalAuth, createServiceProxy(config.services.media, { '^/api/media': '/media' }));

// Search routes (optional auth)
router.use('/search', optionalAuth, createServiceProxy(config.services.feed, { '^/api/search': '/search' }));

export default router;
