import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Document } from "@/services/document.service";
import { useDocumentStatus } from "@/hooks/useDocumentStatus";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";

interface DocumentPreviewModalProps {
  document: Document | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DocumentPreviewModal({ document, isOpen, onClose }: DocumentPreviewModalProps) {
  const { status, data, error } = useDocumentStatus(document?.id || '');

  const renderContent = () => {
    if (error) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }

    if (status === 'pending' || status === 'processing') {
      return (
        <div className="space-y-4">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      );
    }

    if (!data) return null;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-2">Document Details</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Type</span>
                <Badge>{data.documentType}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Confidence</span>
                <Badge variant={data.confidence > 0.8 ? 'success' : 'warning'}>
                  {Math.round(data.confidence * 100)}%
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Extracted Data</h4>
          <div className="space-y-2">
            {Object.entries(data.extractedData).map(([key, value]) => (
              <div key={key} className="flex justify-between items-center py-1 border-b">
                <span className="text-sm text-muted-foreground">{key}</span>
                <span className="text-sm font-medium">{value as string}</span>
              </div>
            ))}
          </div>
        </div>

        {data.warnings && data.warnings.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Warnings</h4>
            <div className="space-y-2">
              {data.warnings.map((warning: string, index: number) => (
                <Alert key={index}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{warning}</AlertDescription>
                </Alert>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {document?.name}
            {status === 'completed' && <CheckCircle className="h-4 w-4 text-green-500" />}
          </DialogTitle>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
} 