import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { MortgageApplication, ApplicationStatus } from '../entities/MortgageApplication';
import { User, UserRole } from '../entities/User';
import { Document, DocumentStatus } from '../entities/Document';
import { AppError } from '../utils/AppError';
import { Between, LessThan, MoreThan, In } from 'typeorm';

export class DashboardController {
  private applicationRepository = AppDataSource.getRepository(MortgageApplication);
  private userRepository = AppDataSource.getRepository(User);
  private documentRepository = AppDataSource.getRepository(Document);

  async getDashboardStats(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const user = await this.userRepository.findOne({
        where: { id: userId }
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Base query for applications
      const queryBuilder = this.applicationRepository.createQueryBuilder('application');

      // If user is not admin/lender, only show their applications
      if (userRole === UserRole.BUYER) {
        queryBuilder.where('application.user = :userId', { userId });
      }

      // Get total applications count
      const totalApplications = await queryBuilder.getCount();

      // Get applications by status
      const applicationsByStatus = await queryBuilder
        .select('application.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .groupBy('application.status')
        .getRawMany();

      // Get recent applications
      const recentApplications = await queryBuilder
        .leftJoinAndSelect('application.user', 'user')
        .leftJoinAndSelect('application.property', 'property')
        .orderBy('application.createdAt', 'DESC')
        .take(5)
        .getMany();

      // Get document statistics
      const documentStats = await this.documentRepository
        .createQueryBuilder('document')
        .select('document.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .groupBy('document.status')
        .getRawMany();

      // Get monthly application trends
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const monthlyTrends = await this.applicationRepository
        .createQueryBuilder('application')
        .select("DATE_TRUNC('month', application.createdAt)", 'month')
        .addSelect('COUNT(*)', 'count')
        .where('application.createdAt >= :startDate', { startDate: sixMonthsAgo })
        .groupBy('month')
        .orderBy('month', 'ASC')
        .getRawMany();

      // Get processing metrics
      const processingMetrics = await this.calculateProcessingMetrics();

      // Get user activity
      const userActivity = await this.getUserActivity(userRole === UserRole.ADMIN);

      res.json({
        data: {
          totalApplications,
          applicationsByStatus,
          recentApplications,
          documentStats,
          monthlyTrends,
          processingMetrics,
          userActivity
        }
      });
    } catch (error) {
      next(error);
    }
  }

  private async calculateProcessingMetrics() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Average processing time for completed applications
    const completedApplications = await this.applicationRepository.find({
      where: {
        status: ApplicationStatus.APPROVED,
        createdAt: MoreThan(thirtyDaysAgo)
      }
    });

    let averageProcessingTime = 0;
    if (completedApplications.length > 0) {
      const totalProcessingTime = completedApplications.reduce((sum, app) => {
        const processingTime = app.updatedAt.getTime() - app.createdAt.getTime();
        return sum + processingTime;
      }, 0);
      averageProcessingTime = totalProcessingTime / completedApplications.length / (1000 * 60 * 60 * 24); // Convert to days
    }

    // Approval rate
    const totalProcessed = await this.applicationRepository.count({
      where: {
        status: In([ApplicationStatus.APPROVED, ApplicationStatus.REJECTED]),
        createdAt: MoreThan(thirtyDaysAgo)
      }
    });

    const totalApproved = await this.applicationRepository.count({
      where: {
        status: ApplicationStatus.APPROVED,
        createdAt: MoreThan(thirtyDaysAgo)
      }
    });

    const approvalRate = totalProcessed > 0 ? (totalApproved / totalProcessed) * 100 : 0;

    return {
      averageProcessingTime,
      approvalRate,
      totalProcessed,
      totalApproved
    };
  }

  private async getUserActivity(isAdmin: boolean) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get active users
    const activeUsers = await this.userRepository
      .createQueryBuilder('user')
      .leftJoin('user.applications', 'application')
      .where('application.createdAt >= :startDate', { startDate: thirtyDaysAgo })
      .select('user.id')
      .distinct(true)
      .getCount();

    // Get user registration trend
    const userRegistrationTrend = await this.userRepository
      .createQueryBuilder('user')
      .select("DATE_TRUNC('day', user.createdAt)", 'date')
      .addSelect('COUNT(*)', 'count')
      .where('user.createdAt >= :startDate', { startDate: thirtyDaysAgo })
      .groupBy('date')
      .orderBy('date', 'ASC')
      .getRawMany();

    // Get user roles distribution (admin only)
    let roleDistribution = null;
    if (isAdmin) {
      roleDistribution = await this.userRepository
        .createQueryBuilder('user')
        .select('user.role', 'role')
        .addSelect('COUNT(*)', 'count')
        .groupBy('user.role')
        .getRawMany();
    }

    return {
      activeUsers,
      userRegistrationTrend,
      roleDistribution
    };
  }
} 