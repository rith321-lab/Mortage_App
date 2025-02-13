import { Router } from 'express';
import { BaseController, BaseEntity } from '../controllers/base.controller';
import { authMiddleware, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { AnyZodObject } from 'zod';
import { UserRole } from '../entities';

export abstract class BaseRouter<T extends BaseEntity> {
  public router: Router;
  protected basePath: string;

  constructor(
    protected controller: BaseController<T>,
    protected createSchema?: AnyZodObject,
    protected updateSchema?: AnyZodObject
  ) {
    this.router = Router();
    this.basePath = '/';
    this.initializeRoutes();
  }

  protected initializeRoutes() {
    // GET all
    this.router.get(
      this.basePath,
      authMiddleware,
      this.controller.getAll
    );

    // GET one by ID
    this.router.get(
      `${this.basePath}:id`,
      authMiddleware,
      this.controller.getById
    );

    // POST create
    if (this.createSchema) {
      this.router.post(
        this.basePath,
        authMiddleware,
        validate(this.createSchema),
        this.controller.create
      );
    }

    // PUT update
    if (this.updateSchema) {
      this.router.put(
        `${this.basePath}:id`,
        authMiddleware,
        validate(this.updateSchema),
        this.controller.update
      );
    }

    // DELETE
    this.router.delete(
      `${this.basePath}:id`,
      authMiddleware,
      authorize(UserRole.ADMIN),
      this.controller.delete
    );
  }

  public getRouter(): Router {
    return this.router;
  }
} 