import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Document, DocumentType, DocumentStatus } from '../entities/Document';
import { MortgageApplication } from '../entities/MortgageApplication';
import { AppError } from '../utils/AppError';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';

interface CreateDocumentDTO {
  key: string;
  type: DocumentType;
  name: string;
  size: number;
  contentType: string;
  applicationId: string;
  uploadedBy: string;
}

interface GetUploadUrlDTO {
  type: DocumentType;
  name: string;
  contentType: string;
  applicationId: string;
}

export class DocumentService {
  private repository: Repository<Document>;
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
    this.repository = AppDataSource.getRepository(Document);
    this.bucketName = process.env.AWS_S3_BUCKET || '';
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
      }
    });
  }

  async getUploadUrl(dto: GetUploadUrlDTO): Promise<{ uploadUrl: string; key: string }> {
    const application = await AppDataSource.getRepository(MortgageApplication)
      .findOne({
        where: { id: dto.applicationId },
        relations: ['user']
      });

    if (!application) {
      throw new AppError('Application not found', 404);
    }

    const key = `documents/${dto.applicationId}/${crypto.randomUUID()}-${dto.name}`;
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: dto.contentType,
    });

    const uploadUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });

    return { uploadUrl, key };
  }

  async create(dto: CreateDocumentDTO): Promise<Document> {
    const application = await AppDataSource.getRepository(MortgageApplication)
      .findOne({
        where: { id: dto.applicationId },
        relations: ['user']
      });

    if (!application) {
      throw new AppError('Application not found', 404);
    }

    const document = this.repository.create({
      key: dto.key,
      type: dto.type,
      name: dto.name,
      size: dto.size,
      contentType: dto.contentType,
      status: DocumentStatus.PENDING,
      application,
      uploadedBy: dto.uploadedBy
    });

    return await this.repository.save(document);
  }

  async getDownloadUrl(id: string, userId: string, userRole: string): Promise<{ downloadUrl: string; contentType: string }> {
    const document = await this.repository.findOne({
      where: { id },
      relations: ['application', 'application.user']
    });

    if (!document) {
      throw new AppError('Document not found', 404);
    }

    // Check access
    if (document.application.user.id !== userId && userRole === 'buyer') {
      throw new AppError('Access denied', 403);
    }

    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: document.key,
    });

    const downloadUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });

    return {
      downloadUrl,
      contentType: document.contentType
    };
  }

  async getAllForApplication(applicationId: string, userId: string, userRole: string): Promise<Document[]> {
    const application = await AppDataSource.getRepository(MortgageApplication)
      .findOne({
        where: { id: applicationId },
        relations: ['user']
      });

    if (!application) {
      throw new AppError('Application not found', 404);
    }

    if (application.user.id !== userId && userRole === 'buyer') {
      throw new AppError('Access denied', 403);
    }

    return await this.repository.find({
      where: { application: { id: applicationId } },
      order: { createdAt: 'DESC' }
    });
  }

  async delete(id: string, userId: string, userRole: string): Promise<void> {
    const document = await this.repository.findOne({
      where: { id },
      relations: ['application', 'application.user']
    });

    if (!document) {
      throw new AppError('Document not found', 404);
    }

    if (document.application.user.id !== userId && userRole !== 'admin') {
      throw new AppError('Access denied', 403);
    }

    // Delete from S3 first
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: document.key,
      });
      await this.s3Client.send(command);
    } catch (error) {
      console.error('Error deleting from S3:', error);
      // Continue with database deletion even if S3 deletion fails
    }

    await this.repository.remove(document);
  }

  async verifyDocument(id: string, verifierId: string, notes?: string): Promise<Document> {
    const document = await this.repository.findOne({
      where: { id },
      relations: ['application']
    });

    if (!document) {
      throw new AppError('Document not found', 404);
    }

    document.status = DocumentStatus.VERIFIED;
    document.verifiedBy = verifierId;
    document.verifiedAt = new Date();
    if (notes) {
      document.notes = notes;
    }

    return await this.repository.save(document);
  }

  async rejectDocument(id: string, verifierId: string, notes: string): Promise<Document> {
    const document = await this.repository.findOne({
      where: { id },
      relations: ['application']
    });

    if (!document) {
      throw new AppError('Document not found', 404);
    }

    document.status = DocumentStatus.REJECTED;
    document.verifiedBy = verifierId;
    document.verifiedAt = new Date();
    document.notes = notes;

    return await this.repository.save(document);
  }
} 