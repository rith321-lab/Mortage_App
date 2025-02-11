import React, { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, X, FileText, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/useToast"

interface FileUploaderProps {
  onUpload: (files: File[]) => Promise<void>
  maxFiles?: number
  maxSize?: number // in bytes
  acceptedFileTypes?: string[]
  className?: string
}

interface UploadingFile {
  file: File
  progress: number
  error?: string
}

const FileUploader = ({
  onUpload,
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // 10MB
  acceptedFileTypes = [".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx"],
  className,
}: FileUploaderProps) => {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])
  const { addToast } = useToast()

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const newFiles = acceptedFiles.map((file) => ({
        file,
        progress: 0,
      }))

      setUploadingFiles((prev) => [...prev, ...newFiles])

      try {
        await onUpload(acceptedFiles)
        addToast("success", "Upload complete", "Files have been uploaded successfully")
        setUploadingFiles([])
      } catch (error) {
        addToast(
          "error",
          "Upload failed",
          error instanceof Error ? error.message : "There was an error uploading your files"
        )
        setUploadingFiles((prev) =>
          prev.map((f) => ({
            ...f,
            error: "Upload failed",
          }))
        )
      }
    },
    [onUpload, addToast]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles,
    maxSize,
    accept: acceptedFileTypes.reduce(
      (acc, type) => ({
        ...acc,
        [type]: [],
      }),
      {}
    ),
  })

  const removeFile = (index: number) => {
    setUploadingFiles((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className={className}>
      <div
        {...getRootProps()}
        className={`p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors
          ${
            isDragActive
              ? "border-primary bg-primary/10"
              : "border-gray-300 hover:border-primary"
          }`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          {isDragActive
            ? "Drop the files here..."
            : "Drag and drop files here, or click to select files"}
        </p>
        <p className="mt-1 text-xs text-gray-500">
          Maximum {maxFiles} files, up to {maxSize / 1024 / 1024}MB each
        </p>
        <p className="mt-1 text-xs text-gray-500">
          Accepted file types: {acceptedFileTypes.join(", ")}
        </p>
      </div>

      {uploadingFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          {uploadingFiles.map((file, index) => (
            <div
              key={`${file.file.name}-${index}`}
              className="flex items-center p-2 bg-gray-50 rounded-md"
            >
              <FileText className="h-5 w-5 text-gray-500 mr-2" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.file.name}</p>
                {file.error ? (
                  <div className="flex items-center text-red-500 text-xs">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {file.error}
                  </div>
                ) : (
                  <Progress value={file.progress} className="h-1 mt-1" />
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="ml-2"
                onClick={() => removeFile(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default FileUploader 