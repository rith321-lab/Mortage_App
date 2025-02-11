import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

export const healthCheck = async (req: Request, res: Response) => {
  try {
    // Check database connection
    const { data, error } = await supabase.from('users').select('count').single();
    
    // Check AWS S3 connection
    const s3Status = await checkS3Connection();

    res.json({
      status: 'healthy',
      database: error ? 'unhealthy' : 'healthy',
      storage: s3Status ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message
    });
  }
}; 