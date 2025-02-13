import React from 'react';
import { FileText, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Document } from '@/types';
import { formatDate, bytesToSize } from '@/lib/utils';

interface DocumentListProps {
  documents: Document[];
  onView: (document: Document) => void;
  onDelete: (document: Document) => void;
}

export function DocumentList({ documents, onView, onDelete }: DocumentListProps) {
  const getStatusIcon = (status: Document['status']) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'issues':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusText = (status: Document['status']) => {
    switch (status) {
      case 'verified':
        return 'Verified';
      case 'issues':
        return 'Issues Found';
      default:
        return 'Pending Verification';
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Document</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Uploaded</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((document) => (
            <TableRow key={document.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">{document.file_name}</span>
                </div>
              </TableCell>
              <TableCell>
                <span className="capitalize">
                  {document.type.replace(/_/g, ' ')}
                </span>
              </TableCell>
              <TableCell>{bytesToSize(document.file_size)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {getStatusIcon(document.status)}
                  <span>{getStatusText(document.status)}</span>
                </div>
              </TableCell>
              <TableCell>{formatDate(document.created_at)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onView(document)}
                  >
                    View
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(document)}
                  >
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {documents.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">
                <div className="flex flex-col items-center gap-2 text-gray-500">
                  <FileText className="w-8 h-8" />
                  <p>No documents uploaded yet</p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
} 