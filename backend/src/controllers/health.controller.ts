import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';

export const healthCheck = async (req: Request, res: Response) => {
  try {
    // Check database connection
    const isDbConnected = AppDataSource.isInitialized;
    
    // Get user count as a basic DB query test
    const userCount = await AppDataSource.getRepository(User).count();

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      checks: {
        database: {
          status: isDbConnected ? 'connected' : 'disconnected',
          userCount
        }
      }
    });
  } catch (err: any) {
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: err.message || 'An unknown error occurred'
    });
  }
}; 