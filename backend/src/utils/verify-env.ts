import { logger } from './logger';
import fs from 'fs';
import path from 'path';

export function verifyEnvironment() {
  const envPath = path.resolve(__dirname, '../../.env');
  
  // Check if .env file exists
  if (!fs.existsSync(envPath)) {
    throw new Error(`.env file not found at ${envPath}`);
  }

  // Read and parse .env file
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = Object.fromEntries(
    envContent
      .split('\n')
      .filter(line => line.trim() && !line.startsWith('#'))
      .map(line => line.split('=').map(part => part.trim()))
  );

  // Required variables
  const requiredVars = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
  ];

  // Check for missing variables
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  // Verify Supabase URL format
  const supabaseUrl = process.env.SUPABASE_URL?.trim();
  try {
    const url = new URL(supabaseUrl!);
    if (!url.protocol.startsWith('https:') || !url.hostname.includes('supabase.co')) {
      throw new Error(`Invalid SUPABASE_URL format: ${supabaseUrl}. Must be a valid HTTPS Supabase URL.`);
    }
  } catch (error) {
    throw new Error(`Invalid SUPABASE_URL: ${supabaseUrl}. Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Compare process.env with .env file
  const mismatchedVars = requiredVars.filter(varName => 
    process.env[varName]?.trim() !== envVars[varName]?.trim()
  );

  if (mismatchedVars.length > 0) {
    logger.warn('Environment variable mismatch detected:', {
      mismatchedVars,
      envFile: mismatchedVars.map(varName => ({ 
        name: varName, 
        value: envVars[varName]?.substring(0, 20) + '...' 
      })),
      processEnv: mismatchedVars.map(varName => ({ 
        name: varName, 
        value: process.env[varName]?.substring(0, 20) + '...' 
      }))
    });
    throw new Error('Environment variables in process.env do not match .env file');
  }

  // Log successful verification
  logger.info('Environment variables verified successfully', {
    supabaseUrl: supabaseUrl?.substring(0, 30) + '...',
    hasSupabaseKey: !!process.env.SUPABASE_ANON_KEY,
  });
} 