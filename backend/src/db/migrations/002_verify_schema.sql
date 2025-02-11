-- Verify enums exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'application_status') THEN
    RAISE EXCEPTION 'Missing enum: application_status';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'document_type') THEN
    RAISE EXCEPTION 'Missing enum: document_type';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'document_status') THEN
    RAISE EXCEPTION 'Missing enum: document_status';
  END IF;
END $$;

-- Verify tables and columns
SELECT 
  table_name, 
  column_name, 
  data_type 
FROM 
  information_schema.columns 
WHERE 
  table_schema = 'public' 
  AND table_name IN ('mortgage_applications', 'documents', 'users'); 