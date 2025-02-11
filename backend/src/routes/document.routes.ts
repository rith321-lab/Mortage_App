import { Router } from 'express';
import { DocumentController } from '../controllers/document.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const documentController = new DocumentController();

// Document routes
router.post('/initiate-upload', authMiddleware, documentController.initiateUpload);
router.post('/confirm-upload/:documentId', authMiddleware, documentController.confirmUpload);
router.get('/:applicationId', authMiddleware, documentController.getDocuments);
router.get('/single/:documentId', authMiddleware, documentController.getDocument);
router.delete('/:documentId', authMiddleware, documentController.deleteDocument);
router.patch('/:documentId/status', authMiddleware, documentController.updateDocumentStatus);
router.get('/:documentId/download', authMiddleware, documentController.getDownloadUrl);

router.post(
  '/',
  authMiddleware, // Protect this route
  documentController.uploadMiddleware, // Handle file upload
  documentController.uploadDocument
);

export default router; 