import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/use-toast';
import { Document, documentService } from '@/services/document.service';

interface DocumentUploadProps {
  applicationId: string;
  documentType: string;
  onUploadComplete: (document: Document) => void;
  onUploadError: (error: Error) => void;
}

interface FileWrapper {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'complete' | 'error';
  error?: string;
}

export function DocumentUpload({
  applicationId,
  documentType,
  onUploadComplete,
  onUploadError
}: DocumentUploadProps) {
  const [uploadingFiles, setUploadingFiles] = useState<FileWrapper[]>([]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      progress: 0,
      status: 'pending' as const
    }));

    setUploadingFiles(prev => [...prev, ...newFiles]);

    for (const fileWrapper of newFiles) {
      try {
        setUploadingFiles(files =>
          files.map(fw =>
            fw.file === fileWrapper.file
              ? { ...fw, status: 'uploading' }
              : fw
          )
        );

        const document = await documentService.upload(
          fileWrapper.file,
          documentType as any,
          applicationId
        );

        setUploadingFiles(files =>
          files.map(fw =>
            fw.file === fileWrapper.file
              ? { ...fw, status: 'complete', progress: 100 }
              : fw
          )
        );

        onUploadComplete(document);
        
        toast({
          title: 'Upload complete',
          description: `Successfully uploaded ${fileWrapper.file.name}`
        });
      } catch (error) {
        setUploadingFiles(files =>
          files.map(fw =>
            fw.file === fileWrapper.file
              ? {
                  ...fw,
                  status: 'error',
                  error: error instanceof Error ? error.message : 'Upload failed'
                }
              : fw
          )
        );

        onUploadError(error instanceof Error ? error : new Error('Upload failed'));
        
        toast({
          variant: 'destructive',
          title: 'Upload failed',
          description: `Failed to upload ${fileWrapper.file.name}. Please try again.`
        });
      }
    }
  }, [applicationId, documentType, onUploadComplete, onUploadError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          ${isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300'}
        `}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          {isDragActive
            ? 'Drop the files here...'
            : 'Drag and drop files here, or click to select files'}
        </p>
      </div>

      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          {uploadingFiles.map((fw) => (
            <div
              key={fw.file.name}
              className="flex items-center gap-4 p-2 border rounded"
            >
              <div className="flex-1">
                <p className="text-sm font-medium">{fw.file.name}</p>
                <Progress value={fw.progress} className="h-1 mt-1" />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setUploadingFiles(files =>
                    files.filter(f => f.file !== fw.file)
                  );
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 