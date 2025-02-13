import React, { useState } from 'react';
import { Document as PDFDocument, Page, pdfjs } from 'react-pdf';
import { FiX, FiChevronLeft, FiChevronRight, FiMaximize, FiMinimize } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { Document } from './DocumentSection';
import { useToast } from '../hooks/useToast';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface DocumentPreviewProps {
  document: Document;
  onClose: () => void;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({ document, onClose }) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { showToast } = useToast();

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const onDocumentLoadError = () => {
    showToast({
      type: 'error',
      title: 'Preview failed',
      message: 'Failed to load document preview. Please try downloading instead.'
    });
  };

  const goToPrevPage = () => {
    setPageNumber(page => Math.max(1, page - 1));
  };

  const goToNextPage = () => {
    setPageNumber(page => Math.min(numPages || page, page + 1));
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const isPDF = document.type === 'application/pdf';
  const isImage = document.type.startsWith('image/');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`
        fixed inset-0 z-50 flex items-center justify-center
        bg-black bg-opacity-75 p-4 sm:p-6
      `}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className={`
          relative bg-white rounded-lg shadow-xl overflow-hidden
          ${isFullscreen ? 'w-full h-full' : 'max-w-4xl w-full max-h-[90vh]'}
        `}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-medium text-gray-900 truncate">
            {document.name}
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleFullscreen}
              className="p-2 text-gray-400 hover:text-gray-500"
            >
              {isFullscreen ? (
                <FiMinimize className="h-5 w-5" />
              ) : (
                <FiMaximize className="h-5 w-5" />
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-500"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="relative flex-1 overflow-auto">
          {isPDF ? (
            <div className="flex flex-col items-center">
              <PDFDocument
                file={document.url}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                className="max-w-full"
              >
                <Page
                  pageNumber={pageNumber}
                  width={isFullscreen ? window.innerWidth - 100 : undefined}
                  className="shadow-lg"
                />
              </PDFDocument>

              {numPages && numPages > 1 && (
                <div className="sticky bottom-0 flex items-center justify-center space-x-4 p-4 bg-white border-t w-full">
                  <button
                    onClick={goToPrevPage}
                    disabled={pageNumber <= 1}
                    className="p-2 text-gray-400 hover:text-gray-500 disabled:opacity-50"
                  >
                    <FiChevronLeft className="h-5 w-5" />
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {pageNumber} of {numPages}
                  </span>
                  <button
                    onClick={goToNextPage}
                    disabled={pageNumber >= (numPages || 1)}
                    className="p-2 text-gray-400 hover:text-gray-500 disabled:opacity-50"
                  >
                    <FiChevronRight className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
          ) : isImage ? (
            <div className="flex items-center justify-center h-full">
              <img
                src={document.url}
                alt={document.name}
                className="max-w-full max-h-full object-contain"
                onError={() => onDocumentLoadError()}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              Preview not available for this file type
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}; 