import { api } from '@/lib/api';
import { Document, ApiResponse } from '@/types';

export const documentService = {
  // Get upload URL and temporary credentials
  async getUploadUrl(
    applicationId: string,
    file: File,
    type: Document['type']
  ): Promise<{ uploadUrl: string; key: string }> {
    const { data } = await api.post<ApiResponse<{ uploadUrl: string; key: string }>>(
      `/mortgage-applications/${applicationId}/documents/upload-url`,
      {
        type,
        name: file.name,
        contentType: file.type
      }
    );
    return data.data;
  },

  // Upload file to S3 using pre-signed URL
  async uploadToS3(
    url: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      if (onProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = (event.loaded / event.total) * 100;
            onProgress(progress);
          }
        };
      }

      xhr.open('PUT', url);
      xhr.setRequestHeader('Content-Type', file.type);

      xhr.onload = () => {
        if (xhr.status === 200) {
          resolve();
        } else {
          reject(new Error('Upload failed'));
        }
      };

      xhr.onerror = () => reject(new Error('Upload failed'));
      xhr.send(file);
    });
  },

  // Create document record after successful upload
  async createDocument(
    applicationId: string,
    key: string,
    file: File,
    type: Document['type']
  ): Promise<Document> {
    const { data } = await api.post<ApiResponse<Document>>(
      `/mortgage-applications/${applicationId}/documents`,
      {
        key,
        type,
        name: file.name,
        size: file.size
      }
    );
    return data.data;
  },

  // Get all documents for an application
  async getApplicationDocuments(applicationId: string): Promise<Document[]> {
    const { data } = await api.get<ApiResponse<Document[]>>(
      `/mortgage-applications/${applicationId}/documents`
    );
    return data.data;
  },

  // Get download URL for a document
  async getDownloadUrl(documentId: string): Promise<string> {
    const { data } = await api.get<ApiResponse<{ downloadUrl: string }>>(
      `/documents/${documentId}/download-url`
    );
    return data.data.downloadUrl;
  },

  // Delete a document
  async deleteDocument(documentId: string): Promise<void> {
    await api.delete(`/documents/${documentId}`);
  },

  // Combined method to handle the entire upload process
  async uploadDocument(
    applicationId: string,
    file: File,
    type: Document['type'],
    onProgress?: (progress: number) => void
  ): Promise<Document> {
    // 1. Get upload URL
    const { uploadUrl, key } = await this.getUploadUrl(applicationId, file, type);

    // 2. Upload to S3
    await this.uploadToS3(uploadUrl, file, onProgress);

    // 3. Create document record
    return await this.createDocument(applicationId, key, file, type);
  },

  // Helper method to get file icon based on type
  getFileIcon(type: Document['type']): string {
    const icons: Record<string, string> = {
      w2: '📄',
      pay_stub: '💵',
      tax_return: '📊',
      bank_statement: '🏦',
      other: '📎'
    };
    return icons[type] || icons.other;
  },

  // Helper method to format file size
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  },

  // Helper method to get file type from mime type
  getFileType(mimeType: string): string {
    const types: Record<string, string> = {
      'application/pdf': 'PDF',
      'image/jpeg': 'Image',
      'image/png': 'Image',
      'application/msword': 'Word',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word',
      'application/vnd.ms-excel': 'Excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel'
    };
    return types[mimeType] || 'Unknown';
  },

  // Helper method to check if file is allowed
  isFileAllowed(file: File): boolean {
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    return allowedTypes.includes(file.type);
  },

  // Helper method to preview document
  async previewDocument(documentId: string): Promise<void> {
    const url = await this.getDownloadUrl(documentId);
    window.open(url, '_blank');
  },

  // Get document analysis results
  async getDocumentAnalysis(documentId: string): Promise<{
    status: 'pending' | 'completed' | 'failed';
    results?: {
      extractedData: Record<string, any>;
      confidence: number;
      issues?: string[];
    };
  }> {
    const { data } = await api.get<
      ApiResponse<{
        status: 'pending' | 'completed' | 'failed';
        results?: {
          extractedData: Record<string, any>;
          confidence: number;
          issues?: string[];
        };
      }>
    >(`/documents/${documentId}/analysis`);
    return data.data;
  },

  async startProcessing(documentId: string): Promise<void> {
    await api.post(`/documents/${documentId}/process`);
  },

  async getProcessingStatus(documentId: string): Promise<ProcessingStatus> {
    const response = await api.get(`/documents/${documentId}/status`);
    return response.data;
  },

  async getDocument(documentId: string): Promise<any> {
    const response = await api.get(`/documents/${documentId}`);
    return response.data;
  },

  async getDocuments(applicationId: string): Promise<Document[]> {
    const { data } = await api.get<Document[]>(`/documents/${applicationId}`);
    return data;
  }
}; 