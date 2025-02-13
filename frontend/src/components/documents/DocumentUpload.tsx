import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { DocumentType } from '@/types';
import { bytesToSize } from '@/lib/utils';
import { toast } from 'sonner';

interface DocumentUploadProps {
  documentType: DocumentType;
  onUpload: (file: File) => Promise<void>;
  maxSize?: number; // in bytes
  acceptedTypes?: string[];
}

export function DocumentUpload({
  documentType,
  onUpload,
  maxSize = 10 * 1024 * 1024, // 10MB default
  acceptedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/tiff',
  ],
}: DocumentUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    try {
      setUploading(true);
      setError(null);
      setProgress(0);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 5;
        });
      }, 100);

      await onUpload(file);

      clearInterval(progressInterval);
      setProgress(100);
      toast.success('Document uploaded successfully');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to upload document');
      toast.error('Failed to upload document');
    } finally {
      setUploading(false);
    }
  }, [onUpload]);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject,
    acceptedFiles,
    fileRejections,
  } = useDropzone({
    onDrop,
    maxSize,
    accept: acceptedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxFiles: 1,
    disabled: uploading,
  });

  const file = acceptedFiles[0];

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors duration-200 ease-in-out
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300'}
          ${isDragReject ? 'border-red-500 bg-red-50' : ''}
          ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center gap-4">
          <div className="p-4 bg-primary/10 rounded-full">
            <Upload className="w-8 h-8 text-primary" />
          </div>

          {file ? (
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              <span className="text-sm font-medium">{file.name}</span>
              <span className="text-sm text-gray-500">({bytesToSize(file.size)})</span>
            </div>
          ) : (
            <>
              <div className="text-lg font-medium">
                {isDragActive
                  ? 'Drop the file here'
                  : 'Drag and drop your document here'}
              </div>
              <div className="text-sm text-gray-500">
                or click to select a file
              </div>
              <div className="text-xs text-gray-400">
                Supported formats: PDF, JPEG, PNG, TIFF
                <br />
                Maximum size: {bytesToSize(maxSize)}
              </div>
            </>
          )}
        </div>
      </div>

      {fileRejections.length > 0 && (
        <div className="mt-4 p-4 bg-red-50 rounded-lg">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Invalid file:</span>
          </div>
          <ul className="mt-2 text-sm text-red-600 list-disc list-inside">
            {fileRejections.map(({ errors }) =>
              errors.map(error => <li key={error.code}>{error.message}</li>)
            )}
          </ul>
        </div>
      )}

      {uploading && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span>Uploading...</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} />
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 rounded-lg">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {file && !uploading && (
        <div className="mt-4 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => acceptedFiles.splice(0, acceptedFiles.length)}
          >
            <X className="w-4 h-4 mr-2" />
            Remove
          </Button>
          <Button onClick={() => onDrop([file])}>
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </Button>
        </div>
      )}
    </div>
  );
} 