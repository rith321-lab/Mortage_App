import { api } from '@/lib/axios';

export interface MortgageApplication {
  id: string;
  status: string;
  propertyDetails: {
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
    };
    propertyType: string;
    purchasePrice: number;
    downPayment: number;
  };
  loanDetails: {
    loanAmount: number;
    loanType: string;
    interestRate: number;
    loanTerm: number;
  };
  applicantDetails: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    ssn: string;
    dateOfBirth: string;
  };
  employmentDetails: {
    employerName: string;
    employmentType: string;
    monthlyIncome: number;
    yearsEmployed: number;
    position: string;
  };
  financialDetails: {
    monthlyDebt: number;
    assets: number;
    liabilities: number;
    creditScore: number;
  };
}

export interface AIAnalysis {
  riskScore: number;
  confidenceScore: number;
  recommendations: string[];
  warnings: string[];
  factors: {
    positive: string[];
    negative: string[];
  };
  metrics: {
    dti: number;
    ltv: number;
    fedti: number;
  };
}

export interface ApplicationSummary {
  application: {
    id: string;
    status: string;
    property_details: {
      purchase_price: number;
      property_type: string;
      address: {
        city: string;
        state: string;
      };
    };
    loan_details: {
      loan_amount: number;
      loan_type: string;
      interest_rate: number;
    };
    metrics: {
      dti: number;
      ltv: number;
      fedti: number;
    };
    documents: Array<{
      id: string;
      type: string;
      status: 'pending' | 'verified' | 'rejected';
    }>;
    ai_analysis?: {
      risk_score: number;
      confidence_score: number;
      recommendations: string[];
      warnings: string[];
    };
  };
}

// Create new application
export const createApplication = async (data: Partial<MortgageApplication>) => {
  const response = await api.post<MortgageApplication>('/api/mortgage/applications', data);
  return response.data;
};

// Get application by ID
export const getApplication = async (id: string) => {
  const response = await api.get<MortgageApplication>(`/api/mortgage/applications/${id}`);
  return response.data;
};

// Get application summary for review
export const getApplicationSummary = async (id: string) => {
  const response = await api.get<ApplicationSummary>(`/api/mortgage/${id}/summary`);
  return response.data;
};

// Update application
export const updateApplication = async (id: string, data: Partial<MortgageApplication>) => {
  const response = await api.put<MortgageApplication>(`/api/mortgage/applications/${id}`, data);
  return response.data;
};

// Submit application for review
export const submitApplication = async (id: string) => {
  const response = await api.post<MortgageApplication>(`/api/mortgage/${id}/submit`);
  return response.data;
};

// Get AI analysis for application
export const getAIAnalysis = async (id: string) => {
  const response = await api.get<AIAnalysis>(`/api/mortgage/applications/${id}/analysis`);
  return response.data;
};

// Get user's applications
export const getUserApplications = async () => {
  const response = await api.get<MortgageApplication[]>('/api/mortgage/applications');
  return response.data;
};

// Delete application
export const deleteApplication = async (id: string) => {
  await api.delete(`/api/mortgage/applications/${id}`);
}; 