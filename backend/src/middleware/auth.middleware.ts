import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { AppError } from './error.middleware';
import { User } from '@supabase/supabase-js';

declare global {
  namespace Express {
    interface Request {
      user?: User;
      session?: any;
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError(401, 'No token provided or invalid token format');
    }

    const token = authHeader.split(' ')[1];
    console.log('Auth token received:', token.substring(0, 10) + '...');

    // Verify session with Supabase
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      console.error('Session error:', sessionError);
      throw new AppError(401, 'Invalid session');
    }

    // Get user details
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      console.error('User error:', userError);
      throw new AppError(401, 'Invalid token');
    }

    // Add user and session to request
    req.user = user;
    req.session = session;

    next();
  } catch (error) {
    next(error instanceof AppError ? error : new AppError(401, 'Authentication failed'));
  }
}; 