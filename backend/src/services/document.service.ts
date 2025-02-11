import { supabase } from '../config/supabase';
import { s3Client } from '../config/aws';
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { AppError } from '../middleware/error.middleware';
import { logger } from './logger.service';

export class DocumentService {
  private bucket = process.env.AWS_S3_BUCKET_NAME!;

  async generateUploadUrl(fileName: string, contentType: string): Promise<string> {
    const key = `uploads/${Date.now()}-${fileName}`;
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType
    });

    return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  }

  async createDocument(data: {
    applicationId: string;
    userId: string;
    type: string;
    name: string;
    key: string;
    size: number;
  }) {
    const { error } = await supabase.from('documents').insert([{
      application_id: data.applicationId,
      user_id: data.userId,
      type: data.type,
      name: data.name,
      key: data.key,
      size: data.size,
      status: 'pending'
    }]);

    if (error) {
      logger.error('Error creating document record:', error);
      throw new AppError(500, 'Failed to create document record');
    }
  }

  async verifyDocument(documentId: string, status: 'verified' | 'rejected', notes?: string) {
    const { error } = await supabase
      .from('documents')
      .update({
        status,
        verification_notes: notes,
        verified_at: new Date().toISOString()
      })
      .eq('id', documentId);

    if (error) {
      logger.error('Error verifying document:', error);
      throw new AppError(500, 'Failed to verify document');
    }
  }

  async deleteDocument(documentId: string) {
    // Get document details
    const { data: document, error: fetchError } = await supabase
      .from('documents')
      .select('key')
      .eq('id', documentId)
      .single();

    if (fetchError || !document) {
      throw new AppError(404, 'Document not found');
    }

    // Delete from S3
    try {
      await s3Client.send(new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: document.key
      }));
    } catch (error) {
      logger.error('Error deleting document from S3:', error);
      throw new AppError(500, 'Failed to delete document from storage');
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId);

    if (deleteError) {
      logger.error('Error deleting document record:', deleteError);
      throw new AppError(500, 'Failed to delete document record');
    }
  }
}

export const documentService = new DocumentService(); 