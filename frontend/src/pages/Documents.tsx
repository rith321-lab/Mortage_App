import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

interface Document {
  id: number;
  fileName: string;
  originalName: string;
  status: string;
  type: string;
  uploadedAt: string;
}

const Documents: React.FC = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const documentTypes = [
    'Income Verification',
    'Employment Verification',
    'Bank Statements',
    'Tax Returns',
    'Property Documents',
    'Identity Documents',
    'Other'
  ];

  useEffect(() => {
    fetchDocuments();
  }, [applicationId]);

  const fetchDocuments = async () => {
    try {
      const response = await axios.get(`/api/documents?applicationId=${applicationId}`);
      setDocuments(response.data);
    } catch (error) {
      setError('Failed to fetch documents');
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedFile || !documentType) {
      setError('Please select a file and document type');
      return;
    }

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('document', selectedFile);
    formData.append('documentType', documentType);
    formData.append('applicationId', applicationId || '');

    try {
      await axios.post('/api/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setSelectedFile(null);
      setDocumentType('');
      fetchDocuments();
    } catch (error) {
      setError('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (documentId: number) => {
    try {
      await axios.delete(`/api/documents/${documentId}`);
      fetchDocuments();
    } catch (error) {
      setError('Failed to delete document');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Document Upload</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleUpload} className="mb-8">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Document Type
          </label>
          <select
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            className="shadow border rounded w-full py-2 px-3 text-gray-700"
            required
          >
            <option value="">Select document type</option>
            {documentTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Select File
          </label>
          <input
            type="file"
            onChange={handleFileSelect}
            className="shadow border rounded w-full py-2 px-3 text-gray-700"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            Supported formats: PDF, DOC, DOCX, JPG, JPEG, PNG (max 5MB)
          </p>
        </div>

        <button
          type="submit"
          disabled={uploading}
          className={`bg-blue-500 text-white font-bold py-2 px-4 rounded ${
            uploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
          }`}
        >
          {uploading ? 'Uploading...' : 'Upload Document'}
        </button>
      </form>

      <div>
        <h2 className="text-xl font-bold mb-4">Uploaded Documents</h2>
        {documents.length === 0 ? (
          <p className="text-gray-500">No documents uploaded yet.</p>
        ) : (
          <div className="grid gap-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="border rounded p-4 flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold">{doc.originalName}</p>
                  <p className="text-sm text-gray-500">
                    Type: {doc.type} | Status: {doc.status}
                  </p>
                  <p className="text-sm text-gray-500">
                    Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Documents;