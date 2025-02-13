import { api } from '@/lib/api';
import {
  MortgageApplication,
  PropertyDetails,
  LoanDetails,
  BorrowerDetails,
  ApplicationStatus,
  ApiResponse
} from '@/types';

// Types
export interface PropertyDetails {
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  propertyType: 'single_family' | 'multi_family' | 'condo' | 'townhouse';
  value: number;
  yearBuilt: number;
}

export interface LoanDetails {
  loanAmount: number;
  loanType: 'conventional' | 'fha' | 'va' | 'jumbo';
  interestRate?: number;
  termYears: number;
  downPayment: number;
  estimatedMonthlyPayment?: number;
  estimatedClosingCosts?: number;
  preApproved?: boolean;
}

export interface IncomeDetails {
  monthlyIncome: number;
  employmentType: 'full_time' | 'part_time' | 'self_employed' | 'retired';
  employerName: string;
  yearsAtJob: number;
  otherIncomeSources?: Array<{
    type: string;
    amount: number;
    frequency: 'monthly' | 'annual';
  }>;
}

export interface AIAnalysis {
  riskScore: number;
  confidence: number;
  processingTime: number; // in hours
  recommendations: string[];
  warnings: string[];
  factors: Array<{
    name: string;
    impact: 'high' | 'medium' | 'low';
    description: string;
    value: number | string;
  }>;
  metrics: {
    dti: number; // Debt-to-Income ratio
    ltv: number; // Loan-to-Value ratio
    pti: number; // Payment-to-Income ratio
    creditUtilization: number;
    reservesMonths: number;
  };
  automationDetails: {
    tasksAutomated: string[];
    manualReviewRequired: string[];
    timesSaved: number; // in hours
    costSaved: number; // in dollars
  };
}

export interface Analytics {
  activeApplications: number;
  averageLoanAmount: number;
  approvalRate: number;
  totalVolume: number;
  aiAccuracy: number;
  processingTime: number;
  metrics: {
    monthlyGrowth: number;
    averageProcessingTime: number;
    aiConfidenceScore: number;
    automationRate: number;
    costSavings: number;
    marketPenetration: number;
  };
  trends: {
    applications: number[];
    approvalRates: number[];
    processingTimes: number[];
  };
  performance: {
    averageResponseTime: number;
    uptime: number;
    errorRate: number;
    userSatisfaction: number;
  };
  roi: {
    processingCostReduction: number;
    timeToClose: number;
    manualWorkReduction: number;
    accuracyImprovement: number;
  };
}

export interface MortgageApplication {
  id: string;
  userId: string;
  status: 'draft' | 'submitted' | 'in_review' | 'approved' | 'rejected';
  propertyDetails: PropertyDetails;
  loanDetails: LoanDetails;
  incomeDetails: IncomeDetails;
  creditScore?: number;
  aiAnalysis?: AIAnalysis;
  documents: Array<{
    id: string;
    type: string;
    name: string;
    status: 'pending' | 'verified' | 'rejected';
    verificationDetails?: {
      verifiedAt: string;
      verifiedBy: string;
      findings: string[];
    };
  }>;
  timeline: Array<{
    status: string;
    timestamp: string;
    details: string;
  }>;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
}

export const mortgageService = {
  // Create a new mortgage application
  async createApplication(): Promise<MortgageApplication> {
    const { data } = await api.post<ApiResponse<MortgageApplication>>('/mortgage-applications');
    return data.data;
  },

  // Get all applications (with optional filters)
  async getAllApplications(
    filters?: {
      status?: ApplicationStatus;
      page?: number;
      limit?: number;
    }
  ): Promise<{ applications: MortgageApplication[]; total: number }> {
    const { data } = await api.get<ApiResponse<{ applications: MortgageApplication[]; total: number }>>(
      '/mortgage-applications',
      { params: filters }
    );
    return data.data;
  },

  // Get a single application by ID
  async getApplication(id: string): Promise<MortgageApplication> {
    const { data } = await api.get<ApiResponse<MortgageApplication>>(`/mortgage-applications/${id}`);
    return data.data;
  },

  // Update application
  async updateApplication(
    id: string,
    applicationData: Partial<MortgageApplication>
  ): Promise<MortgageApplication> {
    const { data } = await api.put<ApiResponse<MortgageApplication>>(
      `/mortgage-applications/${id}`,
      applicationData
    );
    return data.data;
  },

  // Update application status (lenders/admin only)
  async updateApplicationStatus(
    id: string,
    status: ApplicationStatus,
    notes?: string
  ): Promise<MortgageApplication> {
    const { data } = await api.patch<ApiResponse<MortgageApplication>>(
      `/mortgage-applications/${id}/status`,
      { status, notes }
    );
    return data.data;
  },

  // Delete application (draft only)
  async deleteApplication(id: string): Promise<void> {
    await api.delete(`/mortgage-applications/${id}`);
  },

  // Property-related methods
  async createProperty(propertyData: Partial<PropertyDetails>): Promise<PropertyDetails> {
    const { data } = await api.post<ApiResponse<PropertyDetails>>('/properties', propertyData);
    return data.data;
  },

  async updateProperty(
    id: string,
    propertyData: Partial<PropertyDetails>
  ): Promise<PropertyDetails> {
    const { data } = await api.put<ApiResponse<PropertyDetails>>(`/properties/${id}`, propertyData);
    return data.data;
  },

  async getProperty(id: string): Promise<PropertyDetails> {
    const { data } = await api.get<ApiResponse<PropertyDetails>>(`/properties/${id}`);
    return data.data;
  },

  // Loan details methods
  async updateLoanDetails(
    applicationId: string,
    loanData: Partial<LoanDetails>
  ): Promise<LoanDetails> {
    const { data } = await api.put<ApiResponse<LoanDetails>>(
      `/mortgage-applications/${applicationId}/loan-details`,
      loanData
    );
    return data.data;
  },

  // Borrower details methods
  async updateBorrowerDetails(
    applicationId: string,
    borrowerData: Partial<BorrowerDetails>
  ): Promise<BorrowerDetails> {
    const { data } = await api.put<ApiResponse<BorrowerDetails>>(
      `/mortgage-applications/${applicationId}/borrower-details`,
      borrowerData
    );
    return data.data;
  },

  // Helper method to check if an application can be edited
  canEditApplication(application: MortgageApplication, userRole: string): boolean {
    if (userRole === 'admin' || userRole === 'lender') return true;
    return application.status === 'draft';
  },

  // Helper method to check if an application can be deleted
  canDeleteApplication(application: MortgageApplication, userRole: string): boolean {
    if (userRole === 'admin') return true;
    return application.status === 'draft';
  }
}; 