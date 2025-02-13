import React, { useState } from 'react';
import { DocumentUpload } from '../common/DocumentUpload';
import { DocumentList } from '../common/DocumentList';
import { S3Service } from '../../services/s3.service';
import { useToast } from '../../hooks/useToast';

interface Document {
  id: string;
  url: string;
  key: string;
  fileName: string;
  fileType: string;
  uploadedAt: string;
  category: DocumentCategory;
}

export enum DocumentCategory {
  IDENTIFICATION = 'identification',
  INCOME = 'income',
  ASSETS = 'assets',
  PROPERTY = 'property',
  OTHER = 'other',
}

interface DocumentSectionProps {
  documents: Document[];
  onDocumentUpload: (document: Omit<Document, 'id' | 'uploadedAt'>) => void;
  onDocumentDelete: (document: Document) => void;
}

export const DocumentSection: React.FC<DocumentSectionProps> = ({
  documents,
  onDocumentUpload,
  onDocumentDelete,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory>(
    DocumentCategory.IDENTIFICATION
  );
  const { showToast } = useToast();

  const documentCategories = [
    {
      id: DocumentCategory.IDENTIFICATION,
      label: 'Identification Documents',
      description: 'Government-issued ID, passport, or driver's license',
    },
    {
      id: DocumentCategory.INCOME,
      label: 'Income Verification',
      description: 'Pay stubs, W-2s, tax returns',
    },
    {
      id: DocumentCategory.ASSETS,
      label: 'Asset Documentation',
      description: 'Bank statements, investment accounts',
    },
    {
      id: DocumentCategory.PROPERTY,
      label: 'Property Documents',
      description: 'Purchase agreement, appraisal, insurance',
    },
    {
      id: DocumentCategory.OTHER,
      label: 'Other Documents',
      description: 'Any additional supporting documentation',
    },
  ];

  const handleUploadComplete = async (url: string, key: string, file: File) => {
    try {
      await onDocumentUpload({
        url,
        key,
        fileName: file.name,
        fileType: file.type,
        category: selectedCategory,
      });
      showToast({
        title: 'Document uploaded',
        message: 'Your document has been uploaded successfully',
        type: 'success',
      });
    } catch (error) {
      showToast({
        title: 'Upload failed',
        message: 'Failed to upload document. Please try again.',
        type: 'error',
      });
    }
  };

  const handleDelete = async (document: Document) => {
    try {
      await S3Service.deleteFile(document.key);
      await onDocumentDelete(document);
      showToast({
        title: 'Document deleted',
        message: 'Your document has been deleted successfully',
        type: 'success',
      });
    } catch (error) {
      showToast({
        title: 'Delete failed',
        message: 'Failed to delete document. Please try again.',
        type: 'error',
      });
    }
  };

  const filteredDocuments = documents.filter(
    (doc) => doc.category === selectedCategory
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Required Documents
        </h3>

        {/* Category Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {documentCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`
                  pb-4 px-1 border-b-2 font-medium text-sm
                  ${
                    selectedCategory === category.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {category.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Category Description */}
        <div className="mt-4 mb-6">
          <p className="text-sm text-gray-500">
            {
              documentCategories.find(
                (category) => category.id === selectedCategory
              )?.description
            }
          </p>
        </div>

        {/* Upload Area */}
        <DocumentUpload
          onUploadComplete={handleUploadComplete}
          onUploadError={(error) =>
            showToast({
              title: 'Upload failed',
              message: error.message,
              type: 'error',
            })
          }
          label={`Upload ${
            documentCategories.find(
              (category) => category.id === selectedCategory
            )?.label
          }`}
        />

        {/* Document List */}
        <div className="mt-6">
          <DocumentList
            documents={filteredDocuments}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  );
}; 