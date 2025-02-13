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
  private readonly API_URL = process.env.REACT_APP_API_URL || '';
  private readonly MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
  private readonly ALLOWED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/tiff'];

  public validateFile(file: File): string | null {
    if (file.size > this.MAX_FILE_SIZE) {
      return 'File size exceeds 50MB limit';
    }

    if (!this.ALLOWED_FILE_TYPES.includes(file.type)) {
      return 'File type not supported. Please upload PDF, JPG, PNG, or TIFF files only';
    }

    return null;
  }

  public async uploadFile(
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResponse> {
    const error = this.validateFile(file);
    if (error) {
      throw new Error(error);
    }

    try {
      // Get pre-signed URL from backend
      const { data: { url, key } } = await axios.post<{ url: string; key: string }>(
        `${this.API_URL}/api/documents/upload-url`,
        {
          fileName: file.name,
          fileType: file.type
        }
      );

      // Upload file to S3
      await axios.put(url, file, {
        headers: {
          'Content-Type': file.type
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress({
              loaded: progressEvent.loaded,
              total: progressEvent.total,
              percentage
            });
          }
        }
      });

      return { url: url.split('?')[0], key };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to upload file');
      }
      throw error;
    }
  }

  public async deleteFile(key: string): Promise<void> {
    try {
      await axios.delete(`${this.API_URL}/api/documents/${key}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to delete file');
      }
      throw error;
    }
  }
} 