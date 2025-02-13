import { useState, useEffect } from 'react';
import { documentService } from '@/services/document.service';

export function useDocumentStatus(documentId: string) {
  const [status, setStatus] = useState<'pending' | 'processing' | 'completed' | 'failed'>('pending');
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    let isMounted = true;

    const checkStatus = async () => {
      try {
        const result = await documentService.getProcessingStatus(documentId);
        
        if (!isMounted) return;

        setStatus(result.status);
        if (result.data) setData(result.data);
        if (result.error) setError(result.error);

        if (result.status === 'completed' || result.status === 'failed') {
          clearInterval(intervalId);
        }
      } catch (error) {
        if (!isMounted) return;
        setError(error.message);
        clearInterval(intervalId);
      }
    };

    // Initial check
    checkStatus();

    // Poll every 2 seconds
    intervalId = setInterval(checkStatus, 2000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [documentId]);

  return { status, data, error };
} 