import { Router } from 'express';
import { MortgageApplicationController } from '../controllers/mortgage-application.controller';
import { MortgageApplication, UserRole } from '../entities';
import { BaseRouter } from './base.routes';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createMortgageApplicationSchema,
  updateMortgageApplicationSchema,
} from '../schemas/validation';

export class MortgageApplicationRouter extends BaseRouter<MortgageApplication> {
  constructor(controller: MortgageApplicationController) {
    super(controller, createMortgageApplicationSchema, updateMortgageApplicationSchema);
    this.basePath = '/applications/';
    this.initializeCustomRoutes();
  }

  protected initializeCustomRoutes() {
    // Get applications by user
    this.router.get(
      `${this.basePath}user/:userId`,
      authenticate,
      (this.controller as MortgageApplicationController).getByUser
    );

    // Get applications by status (lenders and admins only)
    this.router.get(
      `${this.basePath}status/:status`,
      authenticate,
      authorize(UserRole.LENDER, UserRole.ADMIN),
      (this.controller as MortgageApplicationController).getByStatus
    );

    // Submit application
    this.router.post(
      `${this.basePath}:id/submit`,
      authenticate,
      (this.controller as MortgageApplicationController).submit
    );

    // Update application status (lenders and admins only)
    this.router.patch(
      `${this.basePath}:id/status`,
      authenticate,
      authorize(UserRole.LENDER, UserRole.ADMIN),
      validate(updateMortgageApplicationSchema.pick({ status: true })),
      (this.controller as MortgageApplicationController).updateStatus
    );

    // Save application draft
    this.router.post(
      `${this.basePath}draft`,
      authenticate,
      validate(createMortgageApplicationSchema),
      (this.controller as MortgageApplicationController).saveDraft
    );
  }
} 