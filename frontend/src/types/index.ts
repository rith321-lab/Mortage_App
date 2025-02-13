export type UserRole = 'buyer' | 'loan_officer' | 'processor' | 'underwriter' | 'admin';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'buyer' | 'lender' | 'admin';
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MortgageApplication {
  id: string;
  userId: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  propertyDetails: PropertyDetails;
  loanDetails: LoanDetails;
  borrowerDetails: BorrowerDetails;
  documents: Document[];
  createdAt: string;
  updatedAt: string;
}

export type ApplicationStatus =
  | 'draft'
  | 'submitted'
  | 'processing'
  | 'underwriting'
  | 'approved'
  | 'conditionally_approved'
  | 'rejected'
  | 'needs_review'
  | 'ai_analysis_pending'
  | 'ai_analysis_completed'
  | 'ai_analysis_failed';

export interface PropertyDetails {
  id: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  propertyType: string;
  purchasePrice: number;
  estimatedValue: number;
  mortgageApplicationId: string;
}

export interface LoanDetails {
  id: string;
  loanType: string;
  loanAmount: number;
  downPayment: number;
  interestRate?: number;
  loanTerm: number;
  mortgageApplicationId: string;
}

export interface BorrowerDetails {
  id: string;
  annualIncome: number;
  employmentStatus: string;
  employerName: string;
  jobTitle: string;
  yearsAtJob: number;
  creditScore?: number;
  mortgageApplicationId: string;
}

export interface Document {
  id: string;
  userId: string;
  mortgageApplicationId: string;
  type: 'w2' | 'pay_stub' | 'tax_return' | 'bank_statement' | 'other';
  name: string;
  key: string;
  size: number;
  uploadedAt: string;
}

export type PropertyType = 'single_family' | 'multi_family' | 'condo' | 'townhouse';

export interface Employment {
  employerName: string;
  position: string;
  employmentType: string;
  startDate: string;
  endDate?: string;
  monthlyIncome: number;
}

export type EmploymentType = 'full_time' | 'part_time' | 'self_employed' | 'retired';

export interface Asset {
  type: string;
  institution: string;
  accountNumber: string;
  value: number;
}

export type AssetType = 'checking' | 'savings' | 'investment' | 'retirement' | 'other';

export interface Liability {
  type: string;
  creditor: string;
  accountNumber: string;
  monthlyPayment: number;
  outstandingBalance: number;
}

export type LiabilityType = 'credit_card' | 'car_loan' | 'student_loan' | 'other';

export type LoanType = 'conventional' | 'fha' | 'va' | 'jumbo';

export interface AIAnalysis {
  score: number;
  confidence: number;
  factors: RiskFactor[];
  recommendations: string[];
  conditions: string[];
  warnings: string[];
  errors: string[];
  documentAnalysis?: DocumentAnalysis;
  version: string;
  timestamp: string;
}

export interface RiskFactor {
  name: string;
  impact: 'high' | 'medium' | 'low';
  value: number;
  explanation?: string;
}

export interface DocumentAnalysis {
  analyzed: number;
  verified: number;
  pending: number;
  issues: number;
}

export type DocumentType =
  | 'income_verification'
  | 'employment_verification'
  | 'bank_statement'
  | 'tax_return'
  | 'property_appraisal'
  | 'credit_report'
  | 'identity_verification'
  | 'insurance_proof'
  | 'title_report'
  | 'other';

export type DocumentStatus = 'pending' | 'verified' | 'issues';

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: 'buyer' | 'lender' | 'admin';
  phone?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface FormStep {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  isCurrentStep: boolean;
} 