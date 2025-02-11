import express from 'express';
import authRoutes from './auth.routes';
import documentRoutes from './document.routes'; // Import document routes

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/documents', documentRoutes); // Add document routes

// Add a simple test route
router.get('/test', (req, res) => {
  res.json({ message: 'Backend is reachable!' });
});

export default router; 