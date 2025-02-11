import 'reflect-metadata';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import mortgageRoutes from './routes/mortgage.routes';
import documentRoutes from './routes/document.routes';
import { errorHandler } from './middleware/error.middleware';
import morgan from 'morgan';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { monitorRequest } from './middleware/monitor.middleware';
import { healthCheck } from './controllers/health.controller';

// Load environment variables
dotenv.config();

// Configure rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

const app = express();

// Add request logging in development
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Security headers
app.use(helmet());

// Apply rate limiting
app.use(limiter);

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:5174'
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 600 // Increase preflight cache to 10 minutes
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/mortgage', mortgageRoutes);
app.use('/api/documents', documentRoutes);

// Add monitoring middleware
app.use(monitorRequest);

// Add health check endpoint
app.get('/health', healthCheck);

// Error handling middleware (should be last)
app.use(errorHandler);

// Server startup
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 