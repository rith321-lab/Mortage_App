// Create a new service for Fannie Mae validation rules
import { AppError } from '../middleware/error.middleware';

interface ValidationRule {
  id: string;
  name: string;
  description: string;
  validate: (data: any) => { passed: boolean; message?: string };
}

export const FannieMaeRules: ValidationRule[] = [
  {
    id: 'dti-ratio',
    name: 'Debt-to-Income Ratio',
    description: 'DTI ratio must not exceed 43% for qualified mortgages',
    validate: (data) => ({
      passed: data.dti <= 43,
      message: data.dti > 43 ? 'DTI ratio exceeds Fannie Mae guidelines' : undefined
    })
  },
  // Add more rules...
];

export class ValidationRules {
  // Fannie Mae Guidelines
  readonly MAX_DTI = 43;
  readonly MAX_LTV = 97;
  readonly MIN_CREDIT_SCORE = 620;
  readonly MIN_RESERVES_MONTHS = 2;
  readonly MAX_LOAN_AMOUNT = 726200; // 2023 conforming loan limit

  // Risk Thresholds
  readonly HIGH_RISK_DTI = 43;
  readonly MEDIUM_RISK_DTI = 36;
  readonly HIGH_RISK_LTV = 95;
  readonly MEDIUM_RISK_LTV = 80;
  readonly HIGH_RISK_CREDIT_SCORE = 620;
  readonly MEDIUM_RISK_CREDIT_SCORE = 680;
  readonly HIGH_RISK_RESERVES_RATIO = 0.1;
  readonly MEDIUM_RISK_RESERVES_RATIO = 0.25;

  // Employment Requirements
  readonly MIN_EMPLOYMENT_YEARS = 2;
  readonly PREFERRED_EMPLOYMENT_YEARS = 5;

  // Document Requirements
  readonly REQUIRED_DOCUMENTS = [
    'pay_stub',
    'w2',
    'bank_statement',
    'tax_return',
    'credit_report'
  ];

  // Asset Requirements
  readonly MIN_DOWN_PAYMENT_PERCENT = 3;
  readonly PREFERRED_DOWN_PAYMENT_PERCENT = 20;

  // Property Types
  readonly PROPERTY_TYPES = {
    SINGLE_FAMILY: 'single_family',
    MULTI_FAMILY: 'multi_family',
    CONDO: 'condo',
    TOWNHOUSE: 'townhouse'
  };

  // Loan Types
  readonly LOAN_TYPES = {
    CONVENTIONAL: 'conventional',
    FHA: 'fha',
    VA: 'va',
    JUMBO: 'jumbo'
  };

  // Loan Terms
  readonly LOAN_TERMS = {
    FIFTEEN_YEAR: '15',
    THIRTY_YEAR: '30'
  };

  // Loan Purposes
  readonly LOAN_PURPOSES = {
    PURCHASE: 'purchase',
    REFINANCE: 'refinance'
  };
} 