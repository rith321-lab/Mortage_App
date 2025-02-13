import axios from 'axios';

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadResponse {
  url: string;
  key: string;
}

export class S3Service {
  private static readonly MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
  private static readonly ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/tiff'];

  static validateFile(file: File): string | null {
    if (file.size > this.MAX_FILE_SIZE) {
      return `File size exceeds ${this.MAX_FILE_SIZE / 1024 / 1024}MB limit`;
    }

    if (!this.ALLOWED_TYPES.includes(file.type)) {
      return 'File type not supported. Please upload PDF, JPG, PNG, or TIFF files';
    }

    return null;
  }

  static async uploadFile(
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResponse> {
    // First validate the file
    const validationError = this.validateFile(file);
    if (validationError) {
      throw new Error(validationError);
    }

    try {
      // Get pre-signed URL from backend
      const { data: presignedData } = await axios.post('/api/documents/presigned-url', {
        fileName: file.name,
        fileType: file.type,
      });

      // Upload to S3 using presigned URL
      await axios.put(presignedData.url, file, {
        headers: {
          'Content-Type': file.type,
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            onProgress({
              loaded: progressEvent.loaded,
              total: progressEvent.total,
              percentage: Math.round((progressEvent.loaded * 100) / progressEvent.total),
            });
          }
        },
      });

      return {
        url: presignedData.publicUrl,
        key: presignedData.key,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to upload file');
      }
      throw error;
    }
  }

  static async deleteFile(key: string): Promise<void> {
    try {
      await axios.delete(`/api/documents/${key}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to delete file');
      }
      throw error;
    }
  }
} 