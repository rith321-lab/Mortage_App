CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    mortgage_application_id UUID REFERENCES mortgage_applications(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL, -- S3 key
    file_type VARCHAR(255), -- e.g., 'application/pdf', 'image/jpeg'
    upload_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    category VARCHAR(255) -- e.g., 'paystub', 'bank_statement', 'tax_return'
);

CREATE INDEX idx_documents_user_id ON documents (user_id);
CREATE INDEX idx_documents_mortgage_application_id ON documents (mortgage_application_id); 