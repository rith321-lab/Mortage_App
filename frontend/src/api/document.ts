import { api } from '@/lib/axios';

export interface Document {
  id: string;
  applicationId: string;
  type: string;
  name: string;
  status: 'pending' | 'verified' | 'rejected';
  filePath: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
  verificationDetails?: {
    verifiedAt?: string;
    verifiedBy?: string;
    aiConfidence?: number;
    extractedData?: Record<string, any>;
    issues?: string[];
  };
}

export interface DocumentAnalysis {
  documentType: string;
  confidence: number;
  extractedData: Record<string, any>;
  validation: {
    isValid: boolean;
    issues: string[];
  };
  metadata: {
    pageCount: number;
    processedAt: string;
    processingTime: number;
  };
}

// Upload document
export const uploadDocument = async (applicationId: string, file: File, type: string) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);
  formData.append('applicationId', applicationId);

  const response = await api.post<Document>('/api/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Get document by ID
export const getDocument = async (id: string) => {
  const response = await api.get<Document>(`/api/documents/${id}`);
  return response.data;
};

// Get documents for application
export const getApplicationDocuments = async (applicationId: string) => {
  const response = await api.get<Document[]>(`/api/documents/application/${applicationId}`);
  return response.data;
};

// Delete document
export const deleteDocument = async (id: string) => {
  await api.delete(`/api/documents/${id}`);
};

// Get AI analysis for document
export const getDocumentAnalysis = async (id: string) => {
  const response = await api.get<DocumentAnalysis>(`/api/documents/${id}/analysis`);
  return response.data;
};

// Process document with OCR
export const processDocumentOCR = async (id: string) => {
  const response = await api.post<DocumentAnalysis>(`/api/documents/${id}/process`);
  return response.data;
};

// Verify document
export const verifyDocument = async (id: string, isValid: boolean, notes?: string) => {
  const response = await api.post<Document>(`/api/documents/${id}/verify`, {
    isValid,
    notes,
  });
  return response.data;
};

// Get document download URL
export const getDocumentDownloadUrl = async (id: string) => {
  const response = await api.get<{ url: string }>(`/api/documents/${id}/download-url`);
  return response.data.url;
}; 