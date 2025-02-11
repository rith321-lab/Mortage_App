"use client"

import React, { useState } from "react"
import { Upload, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const requiredDocuments = [
  "Proof of Income",
  "Bank Statements",
  "Tax Returns",
  "Employment Verification",
  "Property Appraisal",
]

export default function Documents() {
  const [uploadedDocuments, setUploadedDocuments] = useState<string[]>([])
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleFiles = (files: FileList) => {
    for (let i = 0; i < files.length; i++) {
      if (!uploadedDocuments.includes(files[i].name)) {
        setUploadedDocuments((prev) => [...prev, files[i].name])
      }
    }
  }

  const uploadProgress = (uploadedDocuments.length / requiredDocuments.length) * 100

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Document Upload</CardTitle>
          <CardDescription>Upload the required documents for your mortgage application</CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={uploadProgress} className="w-full mb-4" />
          <p className="text-sm text-muted-foreground mb-4">
            {uploadedDocuments.length} of {requiredDocuments.length} documents uploaded
          </p>

          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center ${
              dragActive ? "border-primary bg-primary/10" : "border-muted-foreground"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">Drag and drop your files here</p>
            <p className="text-sm text-muted-foreground mb-4">or</p>
            <Button>Select Files</Button>
          </div>

          <Table className="mt-8">
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requiredDocuments.map((doc) => (
                <TableRow key={doc}>
                  <TableCell>{doc}</TableCell>
                  <TableCell>
                    {uploadedDocuments.includes(doc) ? (
                      <span className="flex items-center text-green-600">
                        <CheckCircle className="mr-2 h-4 w-4" /> Uploaded
                      </span>
                    ) : (
                      <span className="flex items-center text-yellow-600">
                        <AlertCircle className="mr-2 h-4 w-4" /> Pending
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <Button className="w-full" disabled={uploadedDocuments.length < requiredDocuments.length}>
            Continue
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
} 