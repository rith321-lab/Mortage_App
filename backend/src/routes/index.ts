import express from 'express';
import mortgageApplicationRoutes from './mortgage-application.routes';
import propertyRoutes from './property.routes';
import documentRoutes from './document.routes';
import dashboardRoutes from './dashboard.routes';

const router = express.Router();

// API routes
router.use('/mortgage-applications', mortgageApplicationRoutes);
router.use('/properties', propertyRoutes);
router.use('/documents', documentRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;