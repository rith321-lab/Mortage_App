import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext'; // Import useAuth
import { uploadDocument } from '../api/document';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from './ui/use-toast';


interface DocumentUploadProps {
  mortgageApplicationId: string;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({ mortgageApplicationId }) => {
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState<string>(''); // State for category
  const { user } = useAuth(); // Get user from context
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select a file to upload.',
      });
      return;
    }
    if (!category) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select a category.',
      });
      return;
    }
    if (!user || !user.access_token) { // Check for user and token
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to upload documents.',
      });
      return;
    }

    setIsUploading(true);
    try {
      const response = await uploadDocument(file, mortgageApplicationId, category, user.access_token); // Pass token
      toast({
        title: 'Success',
        description: 'File uploaded successfully!',
      });
      // Optionally, clear the form or update UI
      setFile(null);
      setCategory('');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: error.message || 'An error occurred during upload.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="file-upload">Select File</Label>
        <Input id="file-upload" type="file" onChange={handleFileChange} />
      </div>
      <div>
        <Label>Category</Label>
        <Select onValueChange={handleCategoryChange} value={category}>
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="paystub">Paystub</SelectItem>
            <SelectItem value="bank_statement">Bank Statement</SelectItem>
            <SelectItem value="tax_return">Tax Return</SelectItem>
            <SelectItem value="identification">Identification</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" disabled={isUploading}>
        {isUploading ? 'Uploading...' : 'Upload Document'}
      </Button>
    </form>
  );
};

export default DocumentUpload; 