import React, { useState } from 'react';
import { FiFile, FiTrash2, FiEye, FiDownload } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { Document } from './DocumentSection';
import { DocumentPreview } from './DocumentPreview';
import { useToast } from '../hooks/useToast';

interface DocumentListProps {
  documents: Document[];
  onDelete: (document: Document) => void;
}

export const DocumentList: React.FC<DocumentListProps> = ({ documents, onDelete }) => {
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const { showToast } = useToast();

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDownload = async (document: Document) => {
    try {
      const response = await fetch(document.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = document.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Download failed',
        message: 'Failed to download the document. Please try again.'
      });
    }
  };

  if (documents.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        No documents uploaded yet
      </div>
    );
  }

  return (
    <>
      <div className="divide-y divide-gray-200">
        <AnimatePresence>
          {documents.map((document) => (
            <motion.div
              key={document.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4 hover:bg-gray-50"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <FiFile className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {document.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(document.size)} • {formatDate(document.uploadedAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleDownload(document)}
                    className="p-2 text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    <span className="sr-only">Download</span>
                    <FiDownload className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setSelectedDocument(document)}
                    className="p-2 text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    <span className="sr-only">Preview</span>
                    <FiEye className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => onDelete(document)}
                    className="p-2 text-gray-400 hover:text-red-500 focus:outline-none"
                  >
                    <span className="sr-only">Delete</span>
                    <FiTrash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {selectedDocument && (
        <DocumentPreview
          document={selectedDocument}
          onClose={() => setSelectedDocument(null)}
        />
      )}
    </>
  );
}; 