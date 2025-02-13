import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { FiX, FiMaximize2, FiMinimize2, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface DocumentPreviewProps {
  url: string;
  fileName: string;
  onClose?: () => void;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  url,
  fileName,
  onClose,
}) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isPDF = url.toLowerCase().endsWith('.pdf');
  const isImage = /\.(jpe?g|png|tiff)$/i.test(url);

  const handleDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const handleDocumentLoadError = (error: Error) => {
    setError('Failed to load document. Please try again later.');
    console.error('Document load error:', error);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const nextPage = () => {
    if (numPages && pageNumber < numPages) {
      setPageNumber(pageNumber + 1);
    }
  };

  const previousPage = () => {
    if (pageNumber > 1) {
      setPageNumber(pageNumber - 1);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`
        fixed inset-0 z-50 flex items-center justify-center
        bg-black bg-opacity-75 p-4 sm:p-6
        ${isFullscreen ? 'overflow-hidden' : 'overflow-auto'}
      `}
    >
      <div
        className={`
          bg-white rounded-lg shadow-xl relative
          ${isFullscreen ? 'w-full h-full' : 'max-w-4xl w-full max-h-[90vh]'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-medium text-gray-900 truncate">
            {fileName}
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleFullscreen}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-full"
            >
              {isFullscreen ? <FiMinimize2 /> : <FiMaximize2 />}
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-full"
              >
                <FiX />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div
          className={`
            relative overflow-auto
            ${isFullscreen ? 'h-[calc(100%-8rem)]' : 'max-h-[calc(90vh-8rem)]'}
          `}
        >
          {error ? (
            <div className="flex items-center justify-center h-full p-4 text-red-500">
              {error}
            </div>
          ) : isPDF ? (
            <Document
              file={url}
              onLoadSuccess={handleDocumentLoadSuccess}
              onLoadError={handleDocumentLoadError}
              className="flex justify-center p-4"
            >
              <Page
                pageNumber={pageNumber}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                className="shadow-lg"
              />
            </Document>
          ) : isImage ? (
            <div className="flex justify-center p-4">
              <img
                src={url}
                alt={fileName}
                className="max-w-full h-auto object-contain shadow-lg"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full p-4 text-gray-500">
              Unsupported file type
            </div>
          )}
        </div>

        {/* Footer */}
        {isPDF && numPages && (
          <div className="flex items-center justify-center space-x-4 p-4 border-t">
            <button
              onClick={previousPage}
              disabled={pageNumber <= 1}
              className={`p-2 rounded-full ${
                pageNumber <= 1 ? 'text-gray-300' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FiChevronLeft />
            </button>
            <span className="text-sm text-gray-600">
              Page {pageNumber} of {numPages}
            </span>
            <button
              onClick={nextPage}
              disabled={pageNumber >= numPages}
              className={`p-2 rounded-full ${
                pageNumber >= numPages ? 'text-gray-300' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FiChevronRight />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}; 