import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUploadCloud, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { S3Service, UploadProgress } from '../services/S3Service';
import { toast } from '@/components/ui/use-toast';

interface DocumentUploadProps {
  onUploadSuccess: (url: string, key: string, file: File) => void;
  acceptedFileTypes?: string[];
  maxFiles?: number;
  label?: string;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  onUploadSuccess,
  acceptedFileTypes = ['.pdf', '.jpg', '.jpeg', '.png'],
  maxFiles = 1,
  label = 'Upload Documents'
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const s3Service = new S3Service();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    setIsUploading(true);
    setUploadProgress(null);

    try {
      for (const file of acceptedFiles) {
        const { url, key } = await s3Service.uploadFile(file, (progress) => {
          setUploadProgress(progress);
        });

        onUploadSuccess(url, key, file);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error instanceof Error ? error.message : 'Failed to upload file'
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  }, [onUploadSuccess, s3Service]);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject
  } = useDropzone({
    onDrop,
    accept: acceptedFileTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxFiles,
    disabled: isUploading
  });

  const getBorderColor = () => {
    if (isDragAccept) return 'border-green-400';
    if (isDragReject) return 'border-red-400';
    if (isDragActive) return 'border-blue-400';
    return 'border-gray-300';
  };

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`
          relative w-full p-6 border-2 border-dashed rounded-lg
          transition-colors duration-150 ease-in-out
          ${getBorderColor()}
          ${isDragActive ? 'bg-blue-50' : 'bg-white'}
          ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-3">
          <FiUploadCloud className="w-12 h-12 text-gray-400" />
          <div className="text-center">
            <p className="text-base font-medium text-gray-700">{label}</p>
            <p className="text-sm text-gray-500">
              Drag & drop files here, or click to select files
            </p>
          </div>
          <div className="text-xs text-gray-500">
            {acceptedFileTypes.join(', ')} files up to 50MB
          </div>
        </div>

        <AnimatePresence>
          {uploadProgress && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90"
            >
              <div className="w-full max-w-sm px-4">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">Uploading...</span>
                  <span className="text-gray-500">{uploadProgress.percentage}%</span>
                </div>
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-blue-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress.percentage}%` }}
                    transition={{ duration: 0.1 }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DocumentUpload; 