import { logger } from './logger';
import fs from 'fs';
import path from 'path';

export function debugEnvironment() {
  const envPath = path.resolve(__dirname, '../../.env');
  
  logger.info('Environment Debug Information:');
  logger.info('Current working directory:', process.cwd());
  logger.info('.env file path:', envPath);
  logger.info('.env file exists:', fs.existsSync(envPath));
  
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envLines = envContent.split('\n');
    
    logger.info('.env file line count:', envLines.length);
    logger.info('First few characters of SUPABASE_URL in .env:', 
      envLines.find(line => line.startsWith('SUPABASE_URL='))?.substring(0, 50) + '...');
  }
  
  logger.info('Process environment variables:');
  logger.info('SUPABASE_URL:', process.env.SUPABASE_URL?.substring(0, 50) + '...');
  logger.info('NODE_ENV:', process.env.NODE_ENV);
  logger.info('PORT:', process.env.PORT);
  
  // Check for potential environment variable conflicts
  const envVars = Object.keys(process.env).filter(key => 
    key.includes('SUPABASE') || 
    key.includes('DATABASE') || 
    key.includes('DB_')
  );
  
  logger.info('Related environment variables:', envVars);
} 