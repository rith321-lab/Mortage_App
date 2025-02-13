import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { S3Service, UploadProgress } from '../../services/s3.service';
import { FiUpload, FiFile, FiX } from 'react-icons/fi';
import { motion } from 'framer-motion';

interface DocumentUploadProps {
  onUploadComplete: (url: string, key: string) => void;
  onUploadError?: (error: Error) => void;
  label?: string;
  accept?: string[];
  maxFiles?: number;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  onUploadComplete,
  onUploadError,
  label = 'Upload Document',
  accept = ['application/pdf', 'image/jpeg', 'image/png', 'image/tiff'],
  maxFiles = 1,
}) => {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    setError(null);
    setIsUploading(true);

    try {
      const file = acceptedFiles[0];
      const result = await S3Service.uploadFile(file, (progress) => {
        setUploadProgress(progress);
      });

      onUploadComplete(result.url, result.key);
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      onUploadError?.(error);
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  }, [onUploadComplete, onUploadError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept.reduce((acc, curr) => ({ ...acc, [curr]: [] }), {}),
    maxFiles,
    disabled: isUploading,
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-lg p-6 
          transition-colors duration-200 ease-in-out
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
          ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-blue-400'}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center justify-center space-y-3">
          <FiUpload className="w-8 h-8 text-gray-400" />
          <div className="text-center">
            <p className="text-base text-gray-600">{label}</p>
            <p className="text-sm text-gray-500">
              Drag & drop your file here, or click to select
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Supported formats: PDF, JPG, PNG, TIFF (max {maxFiles} file{maxFiles > 1 ? 's' : ''})
            </p>
          </div>
        </div>

        {uploadProgress && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90"
          >
            <div className="w-full max-w-xs">
              <div className="mb-2 flex justify-between text-sm text-gray-600">
                <span>Uploading...</span>
                <span>{uploadProgress.percentage}%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-blue-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress.percentage}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-sm text-red-500 flex items-center"
        >
          <FiX className="mr-1" />
          {error}
        </motion.div>
      )}
    </div>
  );
}; 