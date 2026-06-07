import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import routes from './routes';
import { env } from './config/env';

const app = express();

// Enable Cross-Origin requests and JSON body parsing
app.use(cors({
  origin: env.CLIENT_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Simple logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
});

// Mount routes
app.use('/api/v1', routes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: `Cannot ${req.method} ${req.path}` });
});

// Centralized error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled Application Error:', err);
  res.status(500).json({ 
    error: err.message || 'Internal System Failure',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

export default app;
