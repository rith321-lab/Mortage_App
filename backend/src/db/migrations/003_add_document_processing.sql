-- Add document processing related fields
ALTER TABLE documents
ADD COLUMN IF NOT EXISTS ocr_data JSONB,
ADD COLUMN IF NOT EXISTS processing_status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS processing_errors TEXT[],
ADD COLUMN IF NOT EXISTS processed_at TIMESTAMP WITH TIME ZONE;

-- Add indices for better query performance
CREATE INDEX IF NOT EXISTS idx_documents_processing_status 
ON documents(processing_status);

CREATE INDEX IF NOT EXISTS idx_documents_processed_at 
ON documents(processed_at);

-- Add trigger for document processing
CREATE OR REPLACE FUNCTION trigger_document_processing()
RETURNS TRIGGER AS $$
BEGIN
  -- Update processed_at timestamp when processing is complete
  IF NEW.processing_status = 'completed' AND OLD.processing_status != 'completed' THEN
    NEW.processed_at = CURRENT_TIMESTAMP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER document_processing_trigger
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION trigger_document_processing(); 