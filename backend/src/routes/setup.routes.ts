import { Express } from 'express';
import authRoutes from './auth.routes';
import mortgageRoutes from './mortgage.routes';
import documentRoutes from './document.routes';
import { healthCheck } from '../controllers/health.controller';

export const setupRoutes = (app: Express) => {
  // API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/mortgage', mortgageRoutes);
  app.use('/api/documents', documentRoutes);

  // Health check
  app.get('/health', healthCheck);
}; 