import { api } from '@/lib/api';

export interface MortgageApplication {
  id: string;
  status: 'draft' | 'in_progress' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  propertyDetails: {
    address: string;
    propertyType: string;
    purchasePrice: number;
    downPayment: number;
    loanAmount: number;
  };
  incomeEmployment: {
    employerName: string;
    monthlyIncome: number;
    employmentType: string;
    yearsAtJob: number;
  };
  assetsLiabilities: {
    bankAccounts: Array<{
      type: string;
      balance: number;
    }>;
    otherProperties: Array<{
      address: string;
      value: number;
      mortgage: number;
    }>;
    vehicles: Array<{
      make: string;
      model: string;
      year: number;
      value: number;
    }>;
    debts: Array<{
      type: string;
      amount: number;
      monthlyPayment: number;
    }>;
  };
  documents: Array<{
    id: string;
    type: string;
    name: string;
    status: 'pending' | 'verified' | 'rejected';
    uploadedAt: string;
  }>;
  timeline: Array<{
    date: string;
    status: string;
    description: string;
  }>;
}

// Mock data
const mockApplication: MortgageApplication = {
  id: 'mock-app-001',
  status: 'in_progress',
  personalInfo: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '(555) 123-4567'
  },
  propertyDetails: {
    address: '123 Main St, Anytown, USA 12345',
    propertyType: 'single_family',
    purchasePrice: 450000,
    downPayment: 90000,
    loanAmount: 360000
  },
  incomeEmployment: {
    employerName: 'Tech Corp Inc.',
    monthlyIncome: 8500,
    employmentType: 'full_time',
    yearsAtJob: 3
  },
  assetsLiabilities: {
    bankAccounts: [
      { type: 'checking', balance: 25000 },
      { type: 'savings', balance: 85000 }
    ],
    otherProperties: [
      {
        address: '456 Oak Lane, Othertown, USA 12346',
        value: 300000,
        mortgage: 200000
      }
    ],
    vehicles: [
      {
        make: 'Toyota',
        model: 'Camry',
        year: 2020,
        value: 25000
      }
    ],
    debts: [
      {
        type: 'credit_card',
        amount: 5000,
        monthlyPayment: 200
      },
      {
        type: 'student_loan',
        amount: 30000,
        monthlyPayment: 350
      }
    ]
  },
  documents: [
    {
      id: 'doc-001',
      type: 'w2',
      name: 'W2_2023.pdf',
      status: 'verified',
      uploadedAt: '2024-02-01T08:00:00Z'
    },
    {
      id: 'doc-002',
      type: 'bank_statement',
      name: 'Bank_Statement_Jan2024.pdf',
      status: 'verified',
      uploadedAt: '2024-02-01T08:05:00Z'
    },
    {
      id: 'doc-003',
      type: 'pay_stub',
      name: 'PayStub_Jan2024.pdf',
      status: 'pending',
      uploadedAt: '2024-02-01T08:10:00Z'
    }
  ],
  timeline: [
    {
      date: '2024-02-01T08:00:00Z',
      status: 'started',
      description: 'Application started'
    },
    {
      date: '2024-02-01T08:05:00Z',
      status: 'documents_uploaded',
      description: 'Initial documents uploaded'
    },
    {
      date: '2024-02-01T08:10:00Z',
      status: 'in_progress',
      description: 'Application in progress'
    }
  ]
};

export const applicationService = {
  // Get current application
  getCurrentApplication: async (): Promise<MortgageApplication> => {
    // For now, return mock data
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockApplication);
      }, 1000);
    });
  },

  // Update application
  updateApplication: async (data: Partial<MortgageApplication>): Promise<MortgageApplication> => {
    // For now, just merge with mock data and return
    return new Promise((resolve) => {
      setTimeout(() => {
        const updatedApplication = {
          ...mockApplication,
          ...data,
        };
        resolve(updatedApplication);
      }, 1000);
    });
  },

  // Submit application
  submitApplication: async (id: string): Promise<MortgageApplication> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const submittedApplication = {
          ...mockApplication,
          status: 'submitted' as const,
          timeline: [
            ...mockApplication.timeline,
            {
              date: new Date().toISOString(),
              status: 'submitted',
              description: 'Application submitted for review'
            }
          ]
        };
        resolve(submittedApplication);
      }, 1000);
    });
  }
};
