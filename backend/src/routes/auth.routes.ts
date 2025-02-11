import { Router } from 'express';
import { login, signup, resetPasswordRequest, updatePassword, logout, me } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.post('/login', login);
router.post('/signup', signup);
router.post('/reset-password-request', resetPasswordRequest);
router.post('/update-password', authMiddleware, updatePassword);
router.post('/logout', authMiddleware, logout);

// Protected routes
router.get('/me', authMiddleware, me);

export default router; 