import { Express } from 'express';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

export const setupMiddleware = (app: Express) => {
  // Basic middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Security middleware
  app.use(helmet());
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  });
  app.use(limiter);

  // Logging
  if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
  }
}; 