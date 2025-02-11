import { api } from '@/lib/api';

export interface Document {
  id: string;
  type: 'pay_stub' | 'w2' | 'bank_statement' | 'tax_return' | 'id' | 'other';
  name: string;
  size: number;
  status: 'pending' | 'verified' | 'rejected';
  url?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UploadResponse {
  document: Document;
  uploadUrl: string;
}

class DocumentService {
  async upload(file: File, type: Document['type'], applicationId: string): Promise<Document> {
    // 1. Get pre-signed URL
    const { data: { document, uploadUrl } } = await api.post<UploadResponse>('/documents/upload-url', {
      fileName: file.name,
      fileType: file.type,
      documentType: type,
      applicationId
    });

    // 2. Upload to storage
    await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });

    // 3. Confirm upload
    const { data } = await api.post<Document>(`/documents/${document.id}/confirm`);
    return data;
  }

  async getDocuments(applicationId: string): Promise<Document[]> {
    const { data } = await api.get<Document[]>(`/documents/${applicationId}`);
    return data;
  }

  async deleteDocument(documentId: string): Promise<void> {
    await api.delete(`/documents/${documentId}`);
  }
}

export const documentService = new DocumentService(); 