import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { MortgageApplication, ApplicationStatus } from '../entities/MortgageApplication';
import { User } from '../entities/User';
import { AppError } from '../utils/AppError';
import { z } from 'zod';
import { ILike } from 'typeorm';

const mortgageApplicationSchema = z.object({
  propertyId: z.string().uuid().optional(),
  loanDetailsId: z.string().uuid().optional(),
  borrowerDetailsId: z.string().uuid().optional(),
  status: z.nativeEnum(ApplicationStatus).optional(),
  metadata: z.record(z.any()).optional(),
});

const updateStatusSchema = z.object({
  status: z.nativeEnum(ApplicationStatus),
  notes: z.string().optional(),
});

export class MortgageApplicationController {
  private repository = AppDataSource.getRepository(MortgageApplication);

  // Create new application
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const data = mortgageApplicationSchema.parse(req.body);
      
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOneBy({ supabaseId: userId });
      
      if (!user) {
        throw new AppError('User not found', 404);
      }

      const application = this.repository.create({
        ...data,
        user,
        status: ApplicationStatus.DRAFT,
        applicationNumber: await this.generateApplicationNumber(),
      });

      const savedApplication = await this.repository.save(application);

      res.status(201).json({
        data: savedApplication
      });
    } catch (error) {
      next(error);
    }
  }

  // Get all applications (with filters for admin/lender)
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, page = 1, limit = 10 } = req.query;
      const userId = req.user?.id;
      
      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOneBy({ supabaseId: userId });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      const queryBuilder = this.repository.createQueryBuilder('application')
        .leftJoinAndSelect('application.user', 'user')
        .leftJoinAndSelect('application.property', 'property')
        .leftJoinAndSelect('application.loanDetails', 'loanDetails')
        .leftJoinAndSelect('application.borrowerDetails', 'borrowerDetails');

      // If user is not admin/lender, only show their applications
      if (user.role === 'buyer') {
        queryBuilder.where('user.id = :userId', { userId: user.id });
      }

      if (status) {
        queryBuilder.andWhere('application.status = :status', { status });
      }

      const [applications, total] = await queryBuilder
        .skip((+page - 1) * +limit)
        .take(+limit)
        .getManyAndCount();

      res.json({
        data: applications,
        meta: {
          total,
          page: +page,
          limit: +limit,
          pages: Math.ceil(total / +limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get single application
  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const application = await this.repository.findOne({
        where: { id },
        relations: ['user', 'property', 'loanDetails', 'borrowerDetails']
      });

      if (!application) {
        throw new AppError('Application not found', 404);
      }

      // Check if user has access to this application
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOneBy({ supabaseId: userId });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      if (user.role === 'buyer' && application.user.id !== user.id) {
        throw new AppError('Access denied', 403);
      }

      res.json({
        data: application
      });
    } catch (error) {
      next(error);
    }
  }

  // Update application
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const data = mortgageApplicationSchema.parse(req.body);

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const application = await this.repository.findOne({
        where: { id },
        relations: ['user']
      });

      if (!application) {
        throw new AppError('Application not found', 404);
      }

      // Check if user has access to update this application
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOneBy({ supabaseId: userId });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      if (user.role === 'buyer' && application.user.id !== user.id) {
        throw new AppError('Access denied', 403);
      }

      // Don't allow updates to submitted applications unless user is admin/lender
      if (application.status !== ApplicationStatus.DRAFT && user.role === 'buyer') {
        throw new AppError('Cannot update submitted application', 403);
      }

      const updatedApplication = await this.repository.save({
        ...application,
        ...data,
        lastUpdatedBy: user.id
      });

      res.json({
        data: updatedApplication
      });
    } catch (error) {
      next(error);
    }
  }

  // Update application status
  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const { status, notes } = updateStatusSchema.parse(req.body);

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const application = await this.repository.findOne({
        where: { id },
        relations: ['user']
      });

      if (!application) {
        throw new AppError('Application not found', 404);
      }

      // Only admin/lender can update status
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOneBy({ supabaseId: userId });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      if (user.role === 'buyer') {
        throw new AppError('Access denied', 403);
      }

      const updatedApplication = await this.repository.save({
        ...application,
        status,
        metadata: {
          ...application.metadata,
          statusNotes: notes,
          statusUpdatedAt: new Date().toISOString(),
          statusUpdatedBy: user.id
        },
        lastUpdatedBy: user.id
      });

      res.json({
        data: updatedApplication
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete application (draft only)
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const application = await this.repository.findOne({
        where: { id },
        relations: ['user']
      });

      if (!application) {
        throw new AppError('Application not found', 404);
      }

      // Check if user has access to delete this application
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOneBy({ supabaseId: userId });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      if (user.role === 'buyer' && application.user.id !== user.id) {
        throw new AppError('Access denied', 403);
      }

      // Only allow deletion of draft applications
      if (application.status !== ApplicationStatus.DRAFT) {
        throw new AppError('Only draft applications can be deleted', 403);
      }

      await this.repository.remove(application);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  // Helper method to generate unique application number
  private async generateApplicationNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    
    // Get count of applications for this month
    const count = await this.repository.count({
      where: {
        applicationNumber: ILike(`${year}${month}%`)
      }
    });

    // Format: YYMM-XXXXX (e.g., 2402-00001)
    return `${year}${month}-${(count + 1).toString().padStart(5, '0')}`;
  }
} 