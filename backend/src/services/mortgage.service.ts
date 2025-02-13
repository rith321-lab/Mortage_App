import { AppDataSource } from '../config/database';
import { MortgageApplication, ApplicationStatus } from '../entities/MortgageApplication';
import { Property } from '../entities/Property';
import { LoanDetails } from '../entities/LoanDetails';
import { BorrowerDetails } from '../entities/BorrowerDetails';
import { User } from '../entities/User';
import { AppError } from '../utils/AppError';
import { Repository } from 'typeorm';
import { ILike } from 'typeorm';

export class MortgageService {
  private applicationRepository: Repository<MortgageApplication>;
  private propertyRepository: Repository<Property>;
  private loanDetailsRepository: Repository<LoanDetails>;
  private borrowerDetailsRepository: Repository<BorrowerDetails>;
  private userRepository: Repository<User>;

  constructor() {
    this.applicationRepository = AppDataSource.getRepository(MortgageApplication);
    this.propertyRepository = AppDataSource.getRepository(Property);
    this.loanDetailsRepository = AppDataSource.getRepository(LoanDetails);
    this.borrowerDetailsRepository = AppDataSource.getRepository(BorrowerDetails);
    this.userRepository = AppDataSource.getRepository(User);
  }

  async createApplication(userId: string): Promise<MortgageApplication> {
    const user = await this.userRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const application = this.applicationRepository.create({
      user,
      status: ApplicationStatus.DRAFT,
      applicationNumber: await this.generateApplicationNumber()
    });

    return await this.applicationRepository.save(application);
  }

  async getAllApplications(
    userId: string,
    userRole: string,
    filters: {
      status?: ApplicationStatus;
      page?: number;
      limit?: number;
    }
  ): Promise<{ applications: MortgageApplication[]; total: number }> {
    const queryBuilder = this.applicationRepository.createQueryBuilder('application')
      .leftJoinAndSelect('application.user', 'user')
      .leftJoinAndSelect('application.property', 'property')
      .leftJoinAndSelect('application.loanDetails', 'loanDetails')
      .leftJoinAndSelect('application.borrowerDetails', 'borrowerDetails')
      .leftJoinAndSelect('application.documents', 'documents');

    // If user is not admin/lender, only show their applications
    if (userRole === 'buyer') {
      queryBuilder.where('user.id = :userId', { userId });
    }

    if (filters.status) {
      queryBuilder.andWhere('application.status = :status', { status: filters.status });
    }

    const [applications, total] = await queryBuilder
      .skip((filters.page || 0) * (filters.limit || 10))
      .take(filters.limit || 10)
      .getManyAndCount();

    return { applications, total };
  }

  async getApplicationById(id: string, userId: string, userRole: string): Promise<MortgageApplication> {
    const application = await this.applicationRepository.findOne({
      where: { id },
      relations: ['user', 'property', 'loanDetails', 'borrowerDetails', 'documents']
    });

    if (!application) {
      throw new AppError('Application not found', 404);
    }

    // Check if user has access to this application
    if (userRole === 'buyer' && application.user.id !== userId) {
      throw new AppError('Access denied', 403);
    }

    return application;
  }

  async updateApplication(
    id: string,
    userId: string,
    userRole: string,
    data: Partial<MortgageApplication>
  ): Promise<MortgageApplication> {
    const application = await this.applicationRepository.findOne({
      where: { id },
      relations: ['user']
    });

    if (!application) {
      throw new AppError('Application not found', 404);
    }

    // Check if user has access to update this application
    if (userRole === 'buyer' && application.user.id !== userId) {
      throw new AppError('Access denied', 403);
    }

    // Don't allow updates to submitted applications unless user is admin/lender
    if (application.status !== ApplicationStatus.DRAFT && userRole === 'buyer') {
      throw new AppError('Cannot update submitted application', 403);
    }

    Object.assign(application, data);
    application.lastUpdatedBy = userId;

    return await this.applicationRepository.save(application);
  }

  async updateApplicationStatus(
    id: string,
    status: ApplicationStatus,
    userId: string,
    notes?: string
  ): Promise<MortgageApplication> {
    const application = await this.applicationRepository.findOne({
      where: { id },
      relations: ['user']
    });

    if (!application) {
      throw new AppError('Application not found', 404);
    }

    application.status = status;
    application.lastUpdatedBy = userId;
    application.metadata = {
      ...application.metadata,
      statusNotes: notes,
      statusUpdatedAt: new Date().toISOString(),
      statusUpdatedBy: userId
    };

    return await this.applicationRepository.save(application);
  }

  async deleteApplication(id: string, userId: string, userRole: string): Promise<void> {
    const application = await this.applicationRepository.findOne({
      where: { id },
      relations: ['user', 'property', 'loanDetails', 'borrowerDetails', 'documents']
    });

    if (!application) {
      throw new AppError('Application not found', 404);
    }

    // Check if user has access to delete this application
    if (userRole === 'buyer' && application.user.id !== userId) {
      throw new AppError('Access denied', 403);
    }

    // Only allow deletion of draft applications
    if (application.status !== ApplicationStatus.DRAFT) {
      throw new AppError('Only draft applications can be deleted', 403);
    }

    // Delete related entities
    if (application.property) {
      await this.propertyRepository.remove(application.property);
    }
    if (application.loanDetails) {
      await this.loanDetailsRepository.remove(application.loanDetails);
    }
    if (application.borrowerDetails) {
      await this.borrowerDetailsRepository.remove(application.borrowerDetails);
    }

    await this.applicationRepository.remove(application);
  }

  private async generateApplicationNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    
    // Get count of applications for this month using ILike for pattern matching
    const count = await this.applicationRepository.count({
      where: {
        applicationNumber: ILike(`${year}${month}%`)
      }
    });

    // Format: YYMM-XXXXX (e.g., 2402-00001)
    return `${year}${month}-${(count + 1).toString().padStart(5, '0')}`;
  }

  // Helper method to check if an application can be edited
  canEditApplication(application: MortgageApplication, userRole: string): boolean {
    if (userRole === 'admin' || userRole === 'lender') return true;
    return application.status === ApplicationStatus.DRAFT;
  }

  // Helper method to check if an application can be deleted
  canDeleteApplication(application: MortgageApplication, userRole: string): boolean {
    if (userRole === 'admin') return true;
    return application.status === ApplicationStatus.DRAFT;
  }
} 