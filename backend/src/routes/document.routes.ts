import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (_req: express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'application/pdf'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG and PDF files are allowed.'));
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1
  },
  fileFilter
});

interface Document {
  id: string;
  applicationId?: string;
  type: string;
  fileName: string;
  originalName: string;
  path: string;
  status: 'pending' | 'verified' | 'rejected';
  uploadedAt: Date;
}

// In-memory document storage
const documents: Document[] = [];

// Wrap async route handlers
const asyncHandler = (fn: (req: express.Request, res: express.Response, next: express.NextFunction) => Promise<any>) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Upload document
router.post('/', (req, res, next) => {
  upload.single('document')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File is too large. Maximum size is 5MB.' });
      }
      return res.status(400).json({ message: 'File upload error.' });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }

  const document: Document = {
    id: uuidv4(),
    applicationId: req.body.applicationId,
    type: req.body.type || 'other',
    fileName: req.file.filename,
    originalName: req.file.originalname,
    path: req.file.path,
    status: 'pending',
    uploadedAt: new Date()
  };

  documents.push(document);

  // Don't send file path in response
  const response = {
    ...document,
    path: undefined
  };

  res.status(201).json(response);
}));

// Get documents
router.get('/', asyncHandler(async (req, res) => {
  const { applicationId, type } = req.query;
  let result = [...documents];

  if (applicationId) {
    result = result.filter(doc => doc.applicationId === applicationId);
  }

  if (type) {
    result = result.filter(doc => doc.type === type);
  }

  // Remove file paths from response
  const response = result.map(doc => ({
    ...doc,
    path: undefined
  }));

  res.json(response);
}));

// Delete document
router.delete('/:id', asyncHandler(async (req, res) => {
  const documentIndex = documents.findIndex(doc => doc.id === req.params.id);
  
  if (documentIndex === -1) {
    return res.status(404).json({ message: 'Document not found.' });
  }

  const document = documents[documentIndex];

  try {
    // Delete file from filesystem
    if (fs.existsSync(document.path)) {
      await fs.promises.unlink(document.path);
    }
  } catch (error) {
    console.error('Error deleting file:', error);
    // Continue even if file deletion fails
  }

  // Remove from array
  documents.splice(documentIndex, 1);
  res.status(204).send();
}));

// Update document status
router.patch('/:id/status', asyncHandler(async (req, res) => {
  const { status } = req.body;
  const document = documents.find(doc => doc.id === req.params.id);

  if (!document) {
    return res.status(404).json({ message: 'Document not found.' });
  }

  if (!['pending', 'verified', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  document.status = status as 'pending' | 'verified' | 'rejected';
  res.json(document);
}));

// Download document
router.get('/:id/download', asyncHandler(async (req, res) => {
  const document = documents.find(doc => doc.id === req.params.id);

  if (!document) {
    return res.status(404).json({ message: 'Document not found.' });
  }

  if (!fs.existsSync(document.path)) {
    return res.status(404).json({ message: 'File not found.' });
  }

  res.download(document.path, document.originalName);
}));

export default router;