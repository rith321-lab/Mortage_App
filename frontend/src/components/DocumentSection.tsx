import React, { useState } from 'react';
import { DocumentUpload } from './DocumentUpload';
import { DocumentList } from './DocumentList';
import { S3Service } from '../services/S3Service';
import { useToast } from '../hooks/useToast';

export enum DocumentCategory {
  IDENTIFICATION = 'identification',
  INCOME = 'income',
  ASSETS = 'assets',
  PROPERTY = 'property',
  OTHER = 'other'
}

export interface Document {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  category: DocumentCategory;
  uploadedAt: Date;
}

interface DocumentSectionProps {
  documents: Document[];
  onDocumentUpload: (document: Document) => void;
  onDocumentDelete: (document: Document) => void;
}

const CATEGORY_LABELS = {
  [DocumentCategory.IDENTIFICATION]: 'Identification Documents',
  [DocumentCategory.INCOME]: 'Income Documents',
  [DocumentCategory.ASSETS]: 'Asset Documents',
  [DocumentCategory.PROPERTY]: 'Property Documents',
  [DocumentCategory.OTHER]: 'Other Documents'
};

const ACCEPTED_FILE_TYPES = {
  [DocumentCategory.IDENTIFICATION]: ['.pdf', '.jpg', '.jpeg', '.png'],
  [DocumentCategory.INCOME]: ['.pdf', '.jpg', '.jpeg', '.png'],
  [DocumentCategory.ASSETS]: ['.pdf', '.jpg', '.jpeg', '.png'],
  [DocumentCategory.PROPERTY]: ['.pdf', '.jpg', '.jpeg', '.png'],
  [DocumentCategory.OTHER]: ['.pdf', '.jpg', '.jpeg', '.png']
};

export const DocumentSection: React.FC<DocumentSectionProps> = ({
  documents,
  onDocumentUpload,
  onDocumentDelete
}) => {
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory>(DocumentCategory.IDENTIFICATION);
  const { showToast } = useToast();
  const s3Service = new S3Service();

  const handleUploadSuccess = async (url: string, key: string, file: File) => {
    const newDocument: Document = {
      id: key,
      name: file.name,
      url,
      size: file.size,
      type: file.type,
      category: selectedCategory,
      uploadedAt: new Date()
    };

    try {
      onDocumentUpload(newDocument);
      showToast({
        type: 'success',
        title: 'Document uploaded successfully',
        message: `${file.name} has been uploaded.`
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Upload failed',
        message: 'There was an error uploading your document. Please try again.'
      });
    }
  };

  const handleDelete = async (document: Document) => {
    try {
      await s3Service.deleteFile(document.id);
      onDocumentDelete(document);
      showToast({
        type: 'success',
        title: 'Document deleted',
        message: `${document.name} has been deleted.`
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Delete failed',
        message: 'There was an error deleting your document. Please try again.'
      });
    }
  };

  const filteredDocuments = documents.filter(doc => doc.category === selectedCategory);

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">Documents</h2>
        <div className="flex space-x-4 overflow-x-auto pb-2">
          {Object.entries(CATEGORY_LABELS).map(([category, label]) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category as DocumentCategory)}
              className={`
                px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap
                ${selectedCategory === category
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <DocumentUpload
          onUploadSuccess={handleUploadSuccess}
          acceptedFileTypes={ACCEPTED_FILE_TYPES[selectedCategory]}
          maxFiles={5}
          label={`Upload ${CATEGORY_LABELS[selectedCategory]}`}
        />
      </div>

      <div className="bg-white rounded-lg shadow">
        <DocumentList
          documents={filteredDocuments}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}; 