import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface DocumentPreviewProps {
  data: any;
}

export function DocumentPreview({ data }: DocumentPreviewProps) {
  const renderValue = (value: any) => {
    if (typeof value === 'number') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(value);
    }
    return value;
  };

  const renderField = (key: string, value: any) => {
    if (!value) return null;
    
    return (
      <div key={key} className="flex justify-between py-2 border-b">
        <span className="text-sm font-medium">{key}</span>
        <span className="text-sm">{renderValue(value)}</span>
      </div>
    );
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Extracted Data</h3>
        <Badge>{data.documentType}</Badge>
      </div>

      <div className="space-y-1">
        {Object.entries(data.extractedData).map(([key, value]) => 
          renderField(key, value)
        )}
      </div>

      <div className="mt-4 pt-4 border-t">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Confidence Score</span>
          <Badge variant={data.confidence > 0.8 ? 'success' : 'warning'}>
            {Math.round(data.confidence * 100)}%
          </Badge>
        </div>
      </div>
    </Card>
  );
} 