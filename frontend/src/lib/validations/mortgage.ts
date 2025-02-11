import { z } from 'zod';

export const propertySchema = z.object({
  address: z.string().min(5, 'Address is required'),
  propertyType: z.enum(['single-family', 'multi-family', 'condo', 'townhouse']),
  purchasePrice: z.number().min(1, 'Purchase price is required'),
  downPayment: z.number().min(0),
  estimatedValue: z.number().min(1, 'Estimated value is required'),
  occupancyType: z.enum(['primary', 'secondary', 'investment'])
});

export const incomeSchema = z.object({
  employmentType: z.enum(['full-time', 'part-time', 'self-employed', 'retired']),
  employerName: z.string().min(2, 'Employer name is required'),
  monthlyIncome: z.number().min(1, 'Monthly income is required'),
  yearsAtJob: z.number().min(0),
  otherIncome: z.number().optional(),
  otherIncomeSource: z.string().optional()
});

export const assetSchema = z.object({
  type: z.enum(['checking', 'savings', 'investment', 'retirement', 'other']),
  institution: z.string().min(2, 'Institution name is required'),
  accountNumber: z.string().min(4, 'Account number is required'),
  value: z.number().min(0),
  description: z.string().optional()
});

export const liabilitySchema = z.object({
  type: z.enum(['credit-card', 'car-loan', 'student-loan', 'other']),
  creditor: z.string().min(2, 'Creditor name is required'),
  accountNumber: z.string().min(4, 'Account number is required'),
  monthlyPayment: z.number().min(0),
  outstandingBalance: z.number().min(0),
  description: z.string().optional()
});

export const mortgageApplicationSchema = z.object({
  propertyDetails: propertySchema,
  incomeDetails: incomeSchema,
  assets: z.array(assetSchema),
  liabilities: z.array(liabilitySchema)
});

export type MortgageApplication = z.infer<typeof mortgageApplicationSchema>; 