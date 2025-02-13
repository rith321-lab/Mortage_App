import { z } from 'zod';

// Common schemas
const addressSchema = z.object({
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().length(2),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/),
});

const employmentSchema = z.object({
  employerName: z.string().min(1),
  position: z.string().min(1),
  startDate: z.string().datetime(),
  monthlyIncome: z.number().positive(),
  employmentType: z.enum(['full_time', 'part_time', 'self_employed', 'retired']),
});

const assetSchema = z.object({
  type: z.enum(['checking', 'savings', 'investment', 'retirement', 'other']),
  institution: z.string().min(1),
  accountNumber: z.string().min(1),
  value: z.number().positive(),
});

const liabilitySchema = z.object({
  type: z.enum(['credit_card', 'car_loan', 'student_loan', 'other']),
  creditor: z.string().min(1),
  monthlyPayment: z.number().positive(),
  outstandingBalance: z.number().positive(),
  accountNumber: z.string().optional(),
});

// Create application schema
export const createApplicationSchema = z.object({
  body: z.object({
    propertyDetails: z.object({
      address: addressSchema,
      propertyType: z.enum(['single_family', 'multi_family', 'condo', 'townhouse']),
      purchasePrice: z.number().positive(),
      downPayment: z.number().positive(),
      estimatedValue: z.number().positive(),
    }),
    borrowerDetails: z.object({
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      dateOfBirth: z.string().datetime(),
      ssn: z.string().regex(/^\d{3}-\d{2}-\d{4}$/),
      phone: z.string().regex(/^\+?1?\d{10}$/),
      email: z.string().email(),
      currentAddress: addressSchema,
    }),
    employmentHistory: z.array(employmentSchema).min(1),
    assets: z.array(assetSchema),
    liabilities: z.array(liabilitySchema),
    loanDetails: z.object({
      loanType: z.enum(['conventional', 'fha', 'va', 'jumbo']),
      loanTerm: z.enum(['15', '30']),
      loanPurpose: z.enum(['purchase', 'refinance']),
    }),
  }),
});

// Update application schema
export const updateApplicationSchema = z.object({
  body: createApplicationSchema.shape.body.partial(),
});

// Process application schema
export const processApplicationSchema = z.object({
  body: z.object({
    status: z.enum(['approved', 'rejected', 'needs_review']),
    notes: z.string().optional(),
    conditions: z.array(z.string()).optional(),
  }),
});

// Underwrite application schema
export const underwriteApplicationSchema = z.object({
  body: z.object({
    decision: z.enum(['approved', 'rejected', 'conditionally_approved']),
    notes: z.string(),
    conditions: z.array(z.string()).optional(),
    riskScore: z.number().min(0).max(100).optional(),
    dti: z.number().positive().optional(),
    ltv: z.number().positive().optional(),
  }),
}); 