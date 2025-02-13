import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import documentRoutes from './routes/document.routes';
import authRoutes from './routes/auth.routes';

interface DocumentData {
  id: number;
  applicationId: string;
  fileName: string;
  originalName: string;
  path: string;
  uploadedAt: Date;
}

// Extend Express Request to include file from multer
interface MulterRequest extends Request {
  file: Express.Multer.File;
}

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
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
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Mock storage
const documents: DocumentData[] = [];

// Routes
app.use('/api/documents', upload.single('document'), documentRoutes);
app.use('/api/auth', authRoutes);

// Serve static files from uploads directory
app.use('/uploads', express.static(uploadDir));

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: 'File is too large. Maximum size is 5MB'
      });
    }
    return res.status(400).json({
      message: 'File upload error'
    });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: err.message
    });
  }

  res.status(500).json({
    message: 'Internal server error'
  });
});

// Handle 404
app.use((req: Request, res: Response) => {
  res.status(404).json({
    message: 'Route not found'
  });
});

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 5000;

try {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
} catch (error) {
  console.error('Failed to start server:', error);
  process.exit(1);
}