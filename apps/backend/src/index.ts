import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import express, { Request, Response } from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { apiRouter } from './routes';
import { errorHandler } from './middlewares';

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration
app.use(
  cors({
    origin: process.env.APP_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads
const ROOT_DIR = process.env.ROOT_DIR || path.resolve(process.cwd());
const UPLOADS_DIR = process.env.UPLOADS_DIR || (fs.existsSync(path.join(ROOT_DIR, 'uploads')) ? path.join(ROOT_DIR, 'uploads') : path.resolve(process.cwd(), '../../uploads'));
fs.mkdirSync(path.join(UPLOADS_DIR, 'receipts'), { recursive: true });
fs.mkdirSync(path.join(UPLOADS_DIR, 'banners'), { recursive: true });
app.use('/uploads', express.static(UPLOADS_DIR));

// Rate limiting on /api (100 req per 15 min)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
});
app.use('/api', apiLimiter);

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api', apiRouter);

// Global error handler (must be registered at the very end)
app.use(errorHandler);

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
  });
}

export { app };
export default app;
