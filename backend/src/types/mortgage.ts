export enum ApplicationStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  PROCESSING = 'processing',
  UNDERWRITING = 'underwriting',
  APPROVED = 'approved',
  DENIED = 'denied'
}

export interface MortgageApplication {
  id: string;
  userId: string;
  status: ApplicationStatus;
  propertyDetails: PropertyDetails;
  borrowerDetails: BorrowerDetails;
  // ... other fields
}

export interface PropertyDetails {
  address: string;
  propertyType: string;
  purchasePrice: number;
  // ... other fields
}

// ... other interfaces 