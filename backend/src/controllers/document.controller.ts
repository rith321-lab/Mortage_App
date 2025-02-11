import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { AppError } from '../middleware/error.middleware';
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client } from '../config/aws';
import multer from 'multer';

// Use memory storage for multer
const upload = multer({ storage: multer.memoryStorage() });

export class DocumentController {
  // Middleware for handling file uploads
  public uploadMiddleware = upload.single('file');

  public uploadDocument = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        throw new AppError(400, 'No file uploaded');
      }

      const file = req.file;
      const userId = req.user?.id; // Assuming authMiddleware is used
      const { mortgageApplicationId, category } = req.body; // Get mortgage app ID and category

      if (!userId) {
        throw new AppError(401, 'Unauthorized');
      }
      if(!mortgageApplicationId) {
        throw new AppError(400, 'Mortgage application ID is required');
      }

      const fileExtension = file.originalname.split('.').pop();
      const fileName = `${userId}/${mortgageApplicationId}/${Date.now()}.${fileExtension}`;

      const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await s3Client.send(command);

      // Insert document metadata into the database
      const { error: insertError } = await supabase
        .from('documents')
        .insert([
          {
            user_id: userId,
            mortgage_application_id: mortgageApplicationId,
            file_name: file.originalname,
            file_path: fileName, // Store the S3 key
            file_type: file.mimetype,
            category: category,
          },
        ]);

      if (insertError) {
        throw new AppError(500, `Database error: ${insertError.message}`);
      }

      res.status(201).json({
        message: 'File uploaded successfully',
        filePath: fileName,
      });
    } catch (error) {
      next(error);
    }
  };

  // Initiate document upload
  public initiateUpload = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const { applicationId, type, name } = req.body;

      if (!userId) {
        throw new AppError(401, 'User not authenticated');
      }

      // Create document record
      const { data: document, error: docError } = await supabase
        .from('documents')
        .insert({
          applicationId,
          userId,
          type,
          name,
          status: 'pending',
          uploadedAt: new Date(),
        })
        .select()
        .single();

      if (docError) {
        throw new AppError(400, docError.message);
      }

      // Generate upload URL
      const path = `documents/${applicationId}/${document.id}/${name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('mortgage-docs')
        .createSignedUploadUrl(path);

      if (uploadError) {
        throw new AppError(400, uploadError.message);
      }

      res.json({
        document,
        uploadUrl: uploadData.signedUrl,
      });
    } catch (error) {
      next(error);
    }
  };

  // Confirm document upload
  public confirmUpload = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { documentId } = req.params;
      const userId = req.user?.id;

      const { data: document, error: docError } = await supabase
        .from('documents')
        .update({
          status: 'verified',
          verifiedAt: new Date(),
        })
        .eq('id', documentId)
        .eq('userId', userId)
        .select()
        .single();

      if (docError) {
        throw new AppError(400, docError.message);
      }

      res.json(document);
    } catch (error) {
      next(error);
    }
  };

  // Get documents for an application
  public getDocuments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { applicationId } = req.params;
      const userId = req.user?.id;

      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('applicationId', applicationId)
        .eq('userId', userId);

      if (error) {
        throw new AppError(400, error.message);
      }

      res.json(data);
    } catch (error) {
      next(error);
    }
  };

  // Get a specific document
  public getDocument = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { documentId } = req.params;
      const userId = req.user?.id;

      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .eq('userId', userId)
        .single();

      if (error || !data) {
        throw new AppError(404, 'Document not found');
      }

      res.json(data);
    } catch (error) {
      next(error);
    }
  };

  // Delete a document
  public deleteDocument = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { documentId } = req.params;
      const userId = req.user?.id;

      // Get document details first
      const { data: document, error: fetchError } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .eq('userId', userId)
        .single();

      if (fetchError || !document) {
        throw new AppError(404, 'Document not found');
      }

      // Delete from storage
      const path = `documents/${document.applicationId}/${documentId}/${document.name}`;
      const { error: storageError } = await supabase.storage
        .from('mortgage-docs')
        .remove([path]);

      if (storageError) {
        throw new AppError(400, storageError.message);
      }

      // Delete document record
      const { error: deleteError } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId)
        .eq('userId', userId);

      if (deleteError) {
        throw new AppError(400, deleteError.message);
      }

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  // Update document status
  public updateDocumentStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { documentId } = req.params;
      const { status, notes } = req.body;
      const userId = req.user?.id;

      const { data, error } = await supabase
        .from('documents')
        .update({
          status,
          notes,
          verifiedAt: status === 'verified' ? new Date() : null,
        })
        .eq('id', documentId)
        .eq('userId', userId)
        .select()
        .single();

      if (error) {
        throw new AppError(400, error.message);
      }

      res.json(data);
    } catch (error) {
      next(error);
    }
  };

  // Get document download URL
  public getDownloadUrl = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { documentId } = req.params;
      const userId = req.user?.id;

      // Get document details
      const { data: document, error: fetchError } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .eq('userId', userId)
        .single();

      if (fetchError || !document) {
        throw new AppError(404, 'Document not found');
      }

      // Generate download URL
      const path = `documents/${document.applicationId}/${documentId}/${document.name}`;
      const { data: downloadData, error: downloadError } = await supabase.storage
        .from('mortgage-docs')
        .createSignedUrl(path, 3600); // URL expires in 1 hour

      if (downloadError) {
        throw new AppError(400, downloadError.message);
      }

      res.json({ downloadUrl: downloadData.signedUrl });
    } catch (error) {
      next(error);
    }
  };

  public generateUploadUrl = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { fileName, fileType, documentType, applicationId } = req.body;
      const key = `documents/${applicationId}/${Date.now()}-${fileName}`;

      // Create document record in database
      const { data: document, error: dbError } = await supabase
        .from('documents')
        .insert({
          application_id: applicationId,
          type: documentType,
          name: fileName,
          status: 'pending',
          key
        })
        .select()
        .single();

      if (dbError) throw new AppError(400, dbError.message);

      // Generate pre-signed URL
      const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: key,
        ContentType: fileType,
      });

      const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

      res.json({ document, uploadUrl });
    } catch (error) {
      next(error);
    }
  };
} 