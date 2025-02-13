import React, { useState } from 'react';
import { FiFile, FiTrash2, FiEye } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { DocumentPreview } from './DocumentPreview';

interface Document {
  id: string;
  url: string;
  key: string;
  fileName: string;
  fileType: string;
  uploadedAt: string;
}

interface DocumentListProps {
  documents: Document[];
  onDelete?: (document: Document) => void;
}

export const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  onDelete,
}) => {
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  const formatFileSize = (url: string): string => {
    // This is a placeholder. In a real app, you'd want to store and display the actual file size
    return 'N/A';
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getFileIcon = (fileType: string): string => {
    switch (fileType) {
      case 'application/pdf':
        return 'text-red-500';
      case 'image/jpeg':
      case 'image/png':
      case 'image/tiff':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {documents.map((document) => (
          <motion.div
            key={document.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-lg shadow-sm border p-4 flex items-center justify-between"
          >
            <div className="flex items-center space-x-4">
              <FiFile className={`w-6 h-6 ${getFileIcon(document.fileType)}`} />
              <div>
                <h4 className="text-sm font-medium text-gray-900">
                  {document.fileName}
                </h4>
                <div className="flex items-center space-x-4 mt-1">
                  <span className="text-xs text-gray-500">
                    {formatFileSize(document.url)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDate(document.uploadedAt)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setSelectedDocument(document)}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-full"
                title="Preview"
              >
                <FiEye />
              </button>
              {onDelete && (
                <button
                  onClick={() => onDelete(document)}
                  className="p-2 text-gray-500 hover:text-red-500 rounded-full"
                  title="Delete"
                >
                  <FiTrash2 />
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {documents.length === 0 && (
        <div className="text-center py-6 text-gray-500">
          No documents uploaded yet
        </div>
      )}

      {selectedDocument && (
        <DocumentPreview
          url={selectedDocument.url}
          fileName={selectedDocument.fileName}
          onClose={() => setSelectedDocument(null)}
        />
      )}
    </div>
  );
}; 