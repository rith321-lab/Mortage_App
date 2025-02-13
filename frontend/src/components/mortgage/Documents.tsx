"use client"

import React, { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { formatFileSize, formatDate } from "@/lib/utils"
import { Loader2, Upload, File, X, CheckCircle, AlertCircle } from "lucide-react"
import { toast } from "sonner"

interface Document {
  id: string
  fileName: string
  originalName: string
  status: "pending" | "verified" | "rejected"
  uploadedAt: string
  type: string
}

const REQUIRED_DOCUMENTS = [
  {
    type: "income_verification",
    title: "Income Verification",
    description: "Recent pay stubs, W-2s, or tax returns",
    required: true,
  },
  {
    type: "bank_statements",
    title: "Bank Statements",
    description: "Last 2 months of bank statements",
    required: true,
  },
  {
    type: "employment_verification",
    title: "Employment Verification",
    description: "Letter of employment or recent pay stubs",
    required: true,
  },
  {
    type: "id_verification",
    title: "ID Verification",
    description: "Government-issued photo ID",
    required: true,
  },
  {
    type: "additional",
    title: "Additional Documents",
    description: "Any other relevant documents",
    required: false,
  },
]

export function Documents() {
  const queryClient = useQueryClient()
  const [uploadingFiles, setUploadingFiles] = useState<{ [key: string]: boolean }>({})

  // Fetch documents
  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["documents"],
    queryFn: async () => {
      const { data } = await api.get<Document[]>("/api/documents")
      return data
    },
  })

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      try {
        const { data } = await api.post("/api/documents", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        return data
      } catch (error: any) {
        // Handle specific error cases
        if (error.response?.status === 400) {
          throw new Error(error.response.data.message || 'Invalid file')
        }
        throw new Error('Failed to upload document. Please try again.')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] })
      toast.success("Document uploaded successfully")
    },
    onError: (error: Error) => {
      toast.error(error.message)
      console.error("Upload error:", error)
    },
  })

  // Handle file drop
  const onDrop = useCallback(
    async (acceptedFiles: File[], documentType: string) => {
      const file = acceptedFiles[0]
      if (!file) return

      // Validate file size
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File is too large. Maximum size is 5MB")
        return
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']
      if (!allowedTypes.includes(file.type)) {
        toast.error("Invalid file type. Only JPG, PNG and PDF files are allowed")
        return
      }

      setUploadingFiles((prev) => ({ ...prev, [documentType]: true }))

      try {
        const formData = new FormData()
        formData.append("document", file)
        formData.append("type", documentType)
        await uploadMutation.mutateAsync(formData)
      } finally {
        setUploadingFiles((prev) => ({ ...prev, [documentType]: false }))
      }
    },
    [uploadMutation]
  )

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (documentId: string) => {
      await api.delete(`/api/documents/${documentId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] })
      toast.success("Document deleted successfully")
    },
    onError: () => {
      toast.error("Failed to delete document")
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Required Documents</h2>
        <p className="text-muted-foreground">
          Please upload the following documents to complete your application
        </p>
      </div>

      <div className="grid gap-6">
        {REQUIRED_DOCUMENTS.map((docType) => {
          const typeDocuments = documents.filter((doc) => doc.type === docType.type)
          const hasDocument = typeDocuments.length > 0

          const { getRootProps, getInputProps, isDragActive } = useDropzone({
            onDrop: (files) => onDrop(files, docType.type),
            maxFiles: 1,
            multiple: false,
            disabled: uploadingFiles[docType.type],
          })

          return (
            <Card key={docType.type}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{docType.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {docType.description}
                    </p>
                  </div>
                  {docType.required && (
                    <Badge variant="secondary">Required</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {!hasDocument && (
                  <div
                    {...getRootProps()}
                    className={`
                      border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
                      hover:border-primary/50 transition-colors
                      ${isDragActive ? "border-primary bg-primary/5" : "border-muted"}
                    `}
                  >
                    <input {...getInputProps()} />
                    {uploadingFiles[docType.type] ? (
                      <div className="flex items-center justify-center space-x-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Uploading...</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                        <div>
                          <p>Drag & drop a file here, or click to select</p>
                          <p className="text-sm text-muted-foreground">
                            PDF, JPG, or PNG up to 5MB
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {typeDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between py-2"
                  >
                    <div className="flex items-center space-x-3">
                      <File className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{doc.originalName}</p>
                        <p className="text-sm text-muted-foreground">
                          Uploaded {formatDate(doc.uploadedAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {doc.status === "verified" ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : doc.status === "rejected" ? (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      ) : null}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMutation.mutate(doc.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
