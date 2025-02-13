import { Request, Response, NextFunction } from 'express';
import { DocumentService } from '../services/document.service';
import { DocumentType } from '../entities/Document';
import { z } from 'zod';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const documentSchema = z.object({
  type: z.nativeEnum(DocumentType),
  name: z.string(),
  contentType: z.string(),
});

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accept only pdf, doc, docx, jpg, jpeg, png
  const allowedTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, DOCX, JPG, JPEG, and PNG files are allowed.'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

export class DocumentController {
  private documentService: DocumentService;

  constructor() {
    this.documentService = new DocumentService();
  }

  // Generate pre-signed URL for upload
  async getUploadUrl(req: Request, res: Response, next: NextFunction) {
    try {
      const { type, name, contentType } = documentSchema.parse(req.body);
      const { applicationId } = req.params;

      const { uploadUrl, key } = await this.documentService.getUploadUrl({
        type,
        name,
        contentType,
        applicationId
      });

      res.json({
        data: {
          uploadUrl,
          key,
          type,
          name
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Create document record after successful upload
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { applicationId } = req.params;
      const { key, type, name, size, contentType } = req.body;

      const document = await this.documentService.create({
        key,
        type,
        name,
        size,
        contentType,
        applicationId,
        uploadedBy: req.user?.id!
      });

      res.status(201).json({
        data: document
      });
    } catch (error) {
      next(error);
    }
  }

  // Get download URL for document
  async getDownloadUrl(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { downloadUrl, contentType } = await this.documentService.getDownloadUrl(
        id,
        req.user?.id!,
        req.user?.role!
      );

      res.json({
        data: {
          downloadUrl,
          contentType
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get all documents for an application
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { applicationId } = req.params;
      const documents = await this.documentService.getAllForApplication(
        applicationId,
        req.user?.id!,
        req.user?.role!
      );

      res.json({
        data: documents
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete document
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await this.documentService.delete(id, req.user?.id!, req.user?.role!);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  // Verify document
  async verifyDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { notes } = req.body;

      const document = await this.documentService.verifyDocument(
        id,
        req.user?.id!,
        notes
      );

      res.json({
        data: document
      });
    } catch (error) {
      next(error);
    }
  }

  // Reject document
  async rejectDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { notes } = req.body;

      if (!notes) {
        throw new Error('Notes are required when rejecting a document');
      }

      const document = await this.documentService.rejectDocument(
        id,
        req.user?.id!,
        notes
      );

      res.json({
        data: document
      });
    } catch (error) {
      next(error);
    }
  }

  // Upload a document
  async upload(req: Request, res: Response) {
    try {
      upload.single('document')(req, res, async (err) => {
        if (err) {
          if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
              return res.status(400).json({ message: 'File size too large. Maximum size is 5MB.' });
            }
          }
          return res.status(400).json({ message: err.message });
        }

        if (!req.file) {
          return res.status(400).json({ message: 'No file uploaded.' });
        }

        const document = {
          id: Math.floor(Math.random() * 1000) + 1,
          applicationId: req.body.applicationId,
          fileName: req.file.filename,
          originalName: req.file.originalname,
          mimeType: req.file.mimetype,
          size: req.file.size,
          path: req.file.path,
          uploadedAt: new Date(),
          status: 'pending',
          type: req.body.documentType || 'other'
        };

        res.status(201).json(document);
      });
    } catch (error) {
      res.status(500).json({ message: 'Error uploading document' });
    }
  }

  // Get all documents
  async getAllDocuments(req: Request, res: Response) {
    try {
      const applicationId = req.query.applicationId;
      const documents = await this.documentService.getAllForApplication(
        applicationId,
        req.user?.id!,
        req.user?.role!
      );

      res.json(documents);
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving documents' });
    }
  }

  // Get document by ID
  async getDocumentById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const document = await this.documentService.getDocumentById(id);

      if (!document) {
        return res.status(404).json({ message: 'Document not found' });
      }
      
      res.json(document);
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving document' });
    }
  }

  // Delete document
  async deleteDocument(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const document = await this.documentService.getDocumentById(id);
      
      if (!document) {
        return res.status(404).json({ message: 'Document not found' });
      }

      // Delete file from filesystem
      if (fs.existsSync(document.path)) {
        fs.unlinkSync(document.path);
      }

      // Remove from database
      await this.documentService.delete(id, req.user?.id!, req.user?.role!);
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Error deleting document' });
    }
  }

  // Verify document
  async verify(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const document = await this.documentService.getDocumentById(id);
      
      if (!document) {
        return res.status(404).json({ message: 'Document not found' });
      }

      document.status = 'verified';
      document.verifiedAt = new Date();
      
      res.json(document);
    } catch (error) {
      res.status(500).json({ message: 'Error verifying document' });
    }
  }

  // Get document status
  async getStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const document = await this.documentService.getDocumentById(id);
      
      if (!document) {
        return res.status(404).json({ message: 'Document not found' });
      }
      
      res.json({ status: document.status });
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving document status' });
    }
  }
}