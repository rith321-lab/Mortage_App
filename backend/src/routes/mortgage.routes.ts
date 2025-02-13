import express from 'express';
import { MortgageApplicationController } from '../controllers/mortgage-application.controller';
import { validate } from '../middleware/validation.middleware';
import { z } from 'zod';
import { ApplicationStatus } from '../entities/MortgageApplication';

const updateStatusSchema = z.object({
  status: z.nativeEnum(ApplicationStatus),
  notes: z.string().optional(),
});

const router = express.Router();
const controller = new MortgageApplicationController();

// Basic CRUD routes without auth
router.get('/', controller.getAll.bind(controller));
router.get('/:id', controller.getById.bind(controller));
router.post('/', controller.create.bind(controller));
router.put('/:id', controller.update.bind(controller));
router.delete('/:id', controller.delete.bind(controller));

// Application-specific routes
router.post('/:id/submit', controller.submit.bind(controller));
router.post('/draft', controller.saveDraft.bind(controller));

// Update application status (lenders/admin only)
router.patch(
  '/:id/status',
  validate(updateStatusSchema),
  controller.updateStatus.bind(controller)
);

export default router; 