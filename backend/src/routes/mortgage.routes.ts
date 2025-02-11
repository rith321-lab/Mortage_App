import { Router } from 'express';
import { MortgageController } from '../controllers/mortgage.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const mortgageController = new MortgageController();

// Application routes
router.post('/applications', authMiddleware, mortgageController.createApplication);
router.put('/applications/:id', authMiddleware, mortgageController.updateApplication);
router.get('/applications/:id', authMiddleware, mortgageController.getApplication);
router.get('/applications', authMiddleware, mortgageController.getUserApplications);
router.post('/applications/:id/submit', authMiddleware, mortgageController.submitApplication);

export default router; 