import { Request, Response, NextFunction } from 'express';
import { Repository } from 'typeorm';
import { MortgageApplication, ApplicationStatus } from '../entities';
import { BaseController } from './base.controller';
import { createNotFoundError, createAuthorizationError } from '../utils/AppError';
import { AppDataSource } from '../config/database';
import { Property } from '../entities/Property';
import { LoanDetails } from '../entities/LoanDetails';
import { BorrowerDetails } from '../entities/BorrowerDetails';
import { AppError } from '../utils/AppError';

export class MortgageApplicationController extends BaseController<MortgageApplication> {
  private get mortgageApplicationRepository() {
    return AppDataSource.getRepository(MortgageApplication);
  }

  private get propertyRepository() {
    return AppDataSource.getRepository(Property);
  }

  private get loanDetailsRepository() {
    return AppDataSource.getRepository(LoanDetails);
  }

  private get borrowerDetailsRepository() {
    return AppDataSource.getRepository(BorrowerDetails);
  }

  constructor(repository: Repository<MortgageApplication>) {
    super(repository);
  }

  // Override getAll to include relationships
  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const applications = await this.repository.find({
        relations: [
          'user',
          'property',
          'loanDetails',
          'borrowerDetails',
          'borrowerDetails.employmentHistory',
          'borrowerDetails.assets',
          'borrowerDetails.liabilities',
        ],
      });
      res.json(applications);
    } catch (error) {
      next(error);
    }
  };

  // Override getById to include relationships
  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const application = await this.repository.findOne({
        where: { id },
        relations: [
          'user',
          'property',
          'loanDetails',
          'borrowerDetails',
          'borrowerDetails.employmentHistory',
          'borrowerDetails.assets',
          'borrowerDetails.liabilities',
        ],
      });

      if (!application) {
        throw createNotFoundError('Application not found');
      }

      // Check if user has access to this application
      if (
        req.user?.role !== 'admin' &&
        req.user?.role !== 'lender' &&
        application.user.id !== req.user?.id
      ) {
        throw createAuthorizationError('You do not have access to this application');
      }

      res.json(application);
    } catch (error) {
      next(error);
    }
  };

  // Get applications by user
  getByUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const applications = await this.repository.find({
        where: { user: { id: userId } },
        relations: [
          'user',
          'property',
          'loanDetails',
          'borrowerDetails',
          'borrowerDetails.employmentHistory',
          'borrowerDetails.assets',
          'borrowerDetails.liabilities',
        ],
      });
      res.json(applications);
    } catch (error) {
      next(error);
    }
  };

  // Submit application
  submit = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const application = await this.findOneOrFail(id);

      // Check if user has access to submit this application
      if (application.user.id !== req.user?.id) {
        throw createAuthorizationError('You do not have permission to submit this application');
      }

      // Update application status
      application.status = ApplicationStatus.SUBMITTED;
      application.submittedAt = new Date();
      const updatedApplication = await this.repository.save(application);

      res.json(updatedApplication);
    } catch (error) {
      next(error);
    }
  };

  // Update application status (for lenders/admins)
  updateStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const application = await this.findOneOrFail(id);

      // Check if user has permission to update status
      if (req.user?.role !== 'admin' && req.user?.role !== 'lender') {
        throw createAuthorizationError('You do not have permission to update application status');
      }

      // Update status
      application.status = status;
      const updatedApplication = await this.repository.save(application);

      res.json(updatedApplication);
    } catch (error) {
      next(error);
    }
  };

  // Get applications by status
  getByStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status } = req.params;
      const applications = await this.repository.find({
        where: { status },
        relations: [
          'user',
          'property',
          'loanDetails',
          'borrowerDetails',
          'borrowerDetails.employmentHistory',
          'borrowerDetails.assets',
          'borrowerDetails.liabilities',
        ],
      });
      res.json(applications);
    } catch (error) {
      next(error);
    }
  };

  // Save application draft
  saveDraft = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { property, loanDetails, borrowerDetails, ...applicationData } = req.body;

      // Create related entities first
      const newProperty = this.propertyRepository.create(property);
      await this.propertyRepository.save(newProperty);

      const newLoanDetails = this.loanDetailsRepository.create(loanDetails);
      await this.loanDetailsRepository.save(newLoanDetails);

      const newBorrowerDetails = this.borrowerDetailsRepository.create(borrowerDetails);
      await this.borrowerDetailsRepository.save(newBorrowerDetails);

      // Create mortgage application with relationships
      const mortgageApplication = this.repository.create({
        ...applicationData,
        property: newProperty,
        loanDetails: newLoanDetails,
        borrowerDetails: newBorrowerDetails,
        status: ApplicationStatus.DRAFT
      });

      const savedApplication = await this.repository.save(mortgageApplication);

      res.status(201).json(savedApplication);
    } catch (error) {
      next(error);
    }
  };

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { property, loanDetails, borrowerDetails, ...applicationData } = req.body;

      const application = await this.repository.findOne({
        where: { id },
        relations: ['property', 'loanDetails', 'borrowerDetails']
      });

      if (!application) {
        throw new AppError('Mortgage application not found', 404);
      }

      // Update related entities
      if (property) {
        await this.propertyRepository.update(application.property.id, property);
      }
      if (loanDetails) {
        await this.loanDetailsRepository.update(application.loanDetails.id, loanDetails);
      }
      if (borrowerDetails) {
        await this.borrowerDetailsRepository.update(application.borrowerDetails.id, borrowerDetails);
      }

      // Update application
      await this.repository.update(id, applicationData);

      // Fetch updated application
      const updatedApplication = await this.repository.findOne({
        where: { id },
        relations: ['property', 'loanDetails', 'borrowerDetails', 'assets', 'liabilities', 'documents']
      });

      res.json(updatedApplication);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const application = await this.repository.findOne({
        where: { id },
        relations: ['property', 'loanDetails', 'borrowerDetails']
      });

      if (!application) {
        throw new AppError('Mortgage application not found', 404);
      }

      // Delete related entities
      await this.propertyRepository.delete(application.property.id);
      await this.loanDetailsRepository.delete(application.loanDetails.id);
      await this.borrowerDetailsRepository.delete(application.borrowerDetails.id);

      // Delete application
      await this.repository.delete(id);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
} 