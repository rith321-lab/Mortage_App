import { documentService } from '../document.service';
import { supabase } from '../../config/supabase';
import { AppError } from '../../middleware/error.middleware';

describe('DocumentService', () => {
  describe('generateUploadUrl', () => {
    it('should generate a valid upload URL', async () => {
      const url = await documentService.generateUploadUrl('test.pdf', 'application/pdf');
      expect(url).toMatch(/^https:\/\//);
      expect(url).toContain(process.env.AWS_S3_BUCKET_NAME);
    });
  });

  describe('createDocument', () => {
    it('should create a document record', async () => {
      const data = {
        applicationId: '123',
        userId: '456',
        type: 'pay_stub',
        name: 'test.pdf',
        key: 'uploads/test.pdf',
        size: 1024
      };

      await documentService.createDocument(data);

      const { data: doc, error } = await supabase
        .from('documents')
        .select()
        .eq('application_id', data.applicationId)
        .single();

      expect(error).toBeNull();
      expect(doc).toMatchObject({
        application_id: data.applicationId,
        user_id: data.userId,
        type: data.type,
        name: data.name,
        key: data.key,
        size: data.size,
        status: 'pending'
      });
    });

    it('should throw error for invalid data', async () => {
      const data = {
        applicationId: '123',
        userId: '456',
        type: 'invalid_type',
        name: 'test.pdf',
        key: 'uploads/test.pdf',
        size: 1024
      };

      await expect(documentService.createDocument(data)).rejects.toThrow(AppError);
    });
  });
}); 