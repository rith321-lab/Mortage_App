import { Router } from 'express';
import { PropertyController } from '../controllers/property.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { authorize } from '../middleware/auth.middleware';
import { UserRole } from '../entities/User';

export class PropertyRouter {
  public router: Router;
  private controller: PropertyController;
  private basePath: string = '/properties';

  constructor() {
    this.router = Router();
    this.controller = new PropertyController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Create new property
    this.router.post(
      this.basePath,
      authMiddleware,
      this.controller.create.bind(this.controller)
    );

    // Get all properties (admin/lender only)
    this.router.get(
      this.basePath,
      authMiddleware,
      authorize(UserRole.ADMIN, UserRole.LENDER),
      this.controller.getAll.bind(this.controller)
    );

    // Get single property
    this.router.get(
      `${this.basePath}/:id`,
      authMiddleware,
      this.controller.getOne.bind(this.controller)
    );

    // Update property
    this.router.put(
      `${this.basePath}/:id`,
      authMiddleware,
      this.controller.update.bind(this.controller)
    );

    // Delete property (admin only)
    this.router.delete(
      `${this.basePath}/:id`,
      authMiddleware,
      authorize(UserRole.ADMIN),
      this.controller.delete.bind(this.controller)
    );
  }

  public getRouter(): Router {
    return this.router;
  }
} 