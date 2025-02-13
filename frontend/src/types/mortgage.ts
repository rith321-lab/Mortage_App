export interface MortgageApplication {
  id: string;
  status: ApplicationStatus;
  property: Property;
  loanDetails: LoanDetails;
  borrowerDetails: BorrowerDetails;
  assets: Asset[];
  liabilities: Liability[];
  documents: Document[];
  createdAt: Date;
  updatedAt: Date;
  submittedAt?: Date;
}

export enum ApplicationStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  IN_REVIEW = 'in_review',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export interface Property {
  id: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  propertyType: PropertyType;
  purchasePrice: number;
  downPayment: number;
  estimatedValue: number;
  occupancyType: OccupancyType;
  createdAt: Date;
  updatedAt: Date;
}

export enum PropertyType {
  SINGLE_FAMILY = 'single_family',
  MULTI_FAMILY = 'multi_family',
  CONDO = 'condo',
  TOWNHOUSE = 'townhouse'
}

export enum OccupancyType {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  INVESTMENT = 'investment'
}

export interface LoanDetails {
  id: string;
  loanType: LoanType;
  loanTerm: LoanTerm;
  loanAmount: number;
  interestRate?: number;
  createdAt: Date;
  updatedAt: Date;
}

export enum LoanType {
  CONVENTIONAL = 'conventional',
  FHA = 'fha',
  VA = 'va',
  JUMBO = 'jumbo'
}

export enum LoanTerm {
  YEARS_15 = '15',
  YEARS_20 = '20',
  YEARS_30 = '30'
}

export interface BorrowerDetails {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: Date;
  maritalStatus: MaritalStatus;
  currentAddress: string;
  currentCity: string;
  currentState: string;
  currentZip: string;
  yearsAtCurrentAddress: number;
  socialSecurityNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum MaritalStatus {
  SINGLE = 'single',
  MARRIED = 'married',
  DIVORCED = 'divorced',
  WIDOWED = 'widowed'
} 