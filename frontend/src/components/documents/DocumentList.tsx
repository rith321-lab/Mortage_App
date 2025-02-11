import React from 'react';
import { FileText, Download, Trash2, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { Document, documentService } from '@/services/document.service';

interface DocumentListProps {
  documents: Document[];
  onDocumentDelete: (documentId: string) => void;
}

export function DocumentList({ documents, onDocumentDelete }: DocumentListProps) {
  const handleDownload = async (document: Document) => {
    try {
      const { downloadUrl } = await documentService.getDownloadUrl(document.id);
      window.open(downloadUrl, '_blank');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Download failed',
        description: error instanceof Error ? error.message : 'Failed to download document',
      });
    }
  };

  const handleDelete = async (document: Document) => {
    try {
      await documentService.deleteDocument(document.id);
      onDocumentDelete(document.id);
      toast({
        title: 'Document deleted',
        description: 'Document has been deleted successfully.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Delete failed',
        description: error instanceof Error ? error.message : 'Failed to delete document',
      });
    }
  };

  const getStatusIcon = (status: Document['status']) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusText = (status: Document['status']) => {
    switch (status) {
      case 'verified':
        return 'Verified';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Pending Review';
    }
  };

  if (documents.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No documents uploaded yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {documents.map((document) => (
        <Card key={document.id} className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <FileText className="h-8 w-8 text-blue-500" />
              <div>
                <h4 className="font-medium">{document.name}</h4>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span>{new Date(document.uploadedAt).toLocaleDateString()}</span>
                  <span>•</span>
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(document.status)}
                    <span>{getStatusText(document.status)}</span>
                  </div>
                </div>
                {document.notes && (
                  <p className="text-sm text-gray-600 mt-1">{document.notes}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDownload(document)}
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(document)}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
} 