import jwt from 'jsonwebtoken';
import { UserRole } from '../entities/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface JWTPayload {
  id: string;
  email: string;
  role: UserRole;
  metadata?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
  };
}

export const verifyToken = async (token: string): Promise<JWTPayload> => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    throw new Error('Invalid token');
  }
}; 