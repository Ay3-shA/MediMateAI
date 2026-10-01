import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import authRouter from './server/routes/auth';
import profileRouter from './server/routes/profile';
import medicationsRouter from './server/routes/medications';
import conversationsRouter from './server/routes/conversations';
import historyRouter from './server/routes/history';
import settingsRouter from './server/routes/settings';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Security and parser middleware
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Route Mounts
app.use('/api/auth', authRouter);
app.use('/api/profile', profileRouter);
app.use('/api/medications', medicationsRouter);
app.use('/api/conversations', conversationsRouter);
app.use('/api/history', historyRouter);
app.use('/api/settings', settingsRouter);

// System Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    product: 'MediMateAI',
    aiProvider: process.env.AI_PROVIDER || 'gemini',
    aiModel: process.env.AI_MODEL || 'gemini-3.8-flash',
    timestamp: new Date().toISOString(),
  });
});

// Centralized error handling
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[API Server Error]:', err);
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || 'Internal server error occurred.',
    status,
  });
});

// Dev vs Production Frontend Mounting
async function startServer() {
  if (!isProduction) {
    // Development mode: Mount Vite middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: Serve built static assets
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[MediMateAI Server] Running on http://0.0.0.0:${PORT} (Mode: ${isProduction ? 'production' : 'development'})`);
  });
}

startServer().catch(err => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
