import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { User, UserRole } from '../entities';
import { BaseRouter } from './base.routes';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { createUserSchema, updateUserSchema } from '../schemas/validation';

export class UserRouter extends BaseRouter<User> {
  constructor(controller: UserController) {
    super(controller, createUserSchema, updateUserSchema);
    this.basePath = '/users/';
    this.initializeCustomRoutes();
  }

  protected initializeCustomRoutes() {
    // Get user by email
    this.router.get(
      `${this.basePath}email/:email`,
      authMiddleware,
      requireRole([UserRole.ADMIN, UserRole.LENDER]),
      (this.controller as UserController).getByEmail
    );

    // Update user role (admin only)
    this.router.patch(
      `${this.basePath}:id/role`,
      authMiddleware,
      requireRole([UserRole.ADMIN]),
      validate(updateUserSchema.pick({ role: true })),
      (this.controller as UserController).updateRole
    );
  }
} 