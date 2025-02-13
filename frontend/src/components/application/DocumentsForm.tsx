import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, FileCheck } from 'lucide-react';
import { DocumentUpload } from '@/components/documents/DocumentUpload';
import { DocumentList } from '@/components/documents/DocumentList';
import { Document, DocumentType } from '@/types';
import { useToast } from '@/hooks/useToast';

interface DocumentsFormProps {
  form: UseFormReturn<any>;
  applicationId?: string;
}

const requiredDocuments: { type: DocumentType; label: string; description: string }[] = [
  {
    type: 'income_verification',
    label: 'Income Verification',
    description: 'Recent pay stubs, W-2s, or tax returns',
  },
  {
    type: 'employment_verification',
    label: 'Employment Verification',
    description: 'Employment verification letter or recent pay stubs',
  },
  {
    type: 'bank_statement',
    label: 'Bank Statements',
    description: 'Last 2 months of bank statements',
  },
  {
    type: 'tax_return',
    label: 'Tax Returns',
    description: 'Last 2 years of tax returns',
  },
  {
    type: 'identity_verification',
    label: 'Identity Verification',
    description: 'Government-issued photo ID',
  },
];

export function DocumentsForm({ form, applicationId }: DocumentsFormProps) {
  const [documents, setDocuments] = React.useState<Document[]>([]);
  const [activeTab, setActiveTab] = React.useState<DocumentType>('income_verification');
  const { toast } = useToast();

  // Fetch existing documents when applicationId changes
  React.useEffect(() => {
    if (applicationId) {
      // TODO: Fetch documents from API
      // const fetchDocuments = async () => {
      //   const docs = await getApplicationDocuments(applicationId);
      //   setDocuments(docs);
      // };
      // fetchDocuments();
    }
  }, [applicationId]);

  const handleUpload = async (file: File) => {
    try {
      // TODO: Implement actual file upload logic
      const newDoc: Document = {
        id: Math.random().toString(),
        application_id: applicationId || '',
        type: activeTab,
        status: 'pending',
        file_key: file.name,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        uploaded_by: 'current-user-id',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setDocuments([...documents, newDoc]);
      toast({
        title: 'Document uploaded',
        description: 'Your document has been uploaded successfully.',
      });
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Failed to upload document',
        variant: 'destructive',
      });
    }
  };

  const handleView = (document: Document) => {
    // TODO: Implement document viewer
    console.log('View document:', document);
  };

  const handleDelete = async (document: Document) => {
    try {
      // TODO: Implement actual delete logic
      setDocuments(documents.filter(doc => doc.id !== document.id));
      toast({
        title: 'Document deleted',
        description: 'The document has been deleted successfully.',
      });
    } catch (error) {
      toast({
        title: 'Delete failed',
        description: error instanceof Error ? error.message : 'Failed to delete document',
        variant: 'destructive',
      });
    }
  };

  const getDocumentStatus = (type: DocumentType) => {
    const typeDocuments = documents.filter(doc => doc.type === type);
    if (typeDocuments.length === 0) return 'missing';
    if (typeDocuments.some(doc => doc.status === 'verified')) return 'verified';
    if (typeDocuments.some(doc => doc.status === 'issues')) return 'issues';
    return 'pending';
  };

  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Required Documents</AlertTitle>
        <AlertDescription>
          Please upload all required documents to proceed with your application.
          Make sure all documents are clear and legible.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Document Upload</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as DocumentType)}>
            <TabsList className="grid grid-cols-5 w-full">
              {requiredDocuments.map((doc) => (
                <TabsTrigger
                  key={doc.type}
                  value={doc.type}
                  className="relative"
                >
                  {doc.label}
                  {getDocumentStatus(doc.type) === 'verified' && (
                    <FileCheck className="w-4 h-4 text-success absolute -top-1 -right-1" />
                  )}
                </TabsTrigger>
              ))}
            </TabsList>

            {requiredDocuments.map((doc) => (
              <TabsContent key={doc.type} value={doc.type}>
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    {doc.description}
                  </div>

                  <DocumentUpload
                    documentType={doc.type}
                    onUpload={handleUpload}
                    maxSize={10 * 1024 * 1024} // 10MB
                    acceptedTypes={[
                      'application/pdf',
                      'image/jpeg',
                      'image/png',
                      'image/tiff',
                    ]}
                  />

                  <div className="mt-6">
                    <h4 className="text-sm font-medium mb-3">
                      Uploaded Documents
                    </h4>
                    <DocumentList
                      documents={documents.filter(d => d.type === doc.type)}
                      onView={handleView}
                      onDelete={handleDelete}
                    />
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 