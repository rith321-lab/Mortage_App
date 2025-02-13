import { z } from 'zod';
import {
  UserRole,
  ApplicationStatus,
  PropertyType,
  OccupancyType,
  LoanType,
  LoanTerm,
  RateType,
  MaritalStatus,
  EmploymentType,
  AssetType,
  LiabilityType,
} from '../entities';

// Helper schemas
const uuidSchema = z.string().uuid();
const phoneSchema = z.string().regex(/^\+?[1-9]\d{1,14}$/);
const stateSchema = z.string().length(2);
const zipCodeSchema = z.string().regex(/^\d{5}(-\d{4})?$/);
const ssnSchema = z.string().regex(/^\d{3}-?\d{2}-?\d{4}$/);
const currencySchema = z.number().positive().multipleOf(0.01);
const percentageSchema = z.number().min(0).max(100).multipleOf(0.001);

// User schemas
export const createUserSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: phoneSchema.optional(),
  role: z.nativeEnum(UserRole).default(UserRole.BUYER),
});

export const updateUserSchema = createUserSchema.partial();

// Property schemas
export const propertySchema = z.object({
  address: z.string().min(1),
  city: z.string().min(1),
  state: stateSchema,
  zipCode: zipCodeSchema,
  propertyType: z.nativeEnum(PropertyType),
  purchasePrice: currencySchema,
  downPayment: currencySchema,
  estimatedValue: currencySchema,
  occupancyType: z.nativeEnum(OccupancyType),
});

// Loan details schemas
export const loanDetailsSchema = z.object({
  loanType: z.nativeEnum(LoanType),
  loanAmount: currencySchema,
  loanTerm: z.nativeEnum(LoanTerm),
  rateType: z.nativeEnum(RateType),
  interestRate: percentageSchema.optional(),
  annualPercentageRate: percentageSchema.optional(),
});

// Borrower details schemas
export const borrowerDetailsSchema = z.object({
  socialSecurityNumber: ssnSchema,
  dateOfBirth: z.string().datetime(),
  maritalStatus: z.nativeEnum(MaritalStatus),
  currentAddress: z.string().min(1),
  currentCity: z.string().min(1),
  currentState: stateSchema,
  currentZipCode: zipCodeSchema,
  yearsAtCurrentAddress: z.number().int().min(0),
  monthsAtCurrentAddress: z.number().int().min(0).max(11),
  previousAddress: z.string().optional(),
  previousCity: z.string().optional(),
  previousState: stateSchema.optional(),
  previousZipCode: zipCodeSchema.optional(),
});

// Employment history schemas
export const employmentHistorySchema = z.object({
  employerName: z.string().min(1),
  employerAddress: z.string().min(1),
  employerCity: z.string().min(1),
  employerState: stateSchema,
  employerZipCode: zipCodeSchema,
  employerPhone: phoneSchema,
  position: z.string().min(1),
  employmentType: z.nativeEnum(EmploymentType),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  monthlyIncome: currencySchema,
  annualIncome: currencySchema,
  isCurrentEmployer: z.boolean(),
});

// Asset schemas
export const assetSchema = z.object({
  assetType: z.nativeEnum(AssetType),
  institutionName: z.string().min(1),
  accountNumber: z.string().optional(),
  currentValue: currencySchema,
  description: z.string().optional(),
  isLiquid: z.boolean(),
  verificationDocument: z.string().optional(),
});

// Liability schemas
export const liabilitySchema = z.object({
  liabilityType: z.nativeEnum(LiabilityType),
  creditorName: z.string().min(1),
  accountNumber: z.string().optional(),
  unpaidBalance: currencySchema,
  monthlyPayment: currencySchema,
  paymentRemainingMonths: z.number().int().positive().optional(),
  interestRate: percentageSchema.optional(),
  isRevolvingCredit: z.boolean(),
  toBePaidOff: z.boolean(),
  description: z.string().optional(),
});

// Mortgage application schemas
export const createMortgageApplicationSchema = z.object({
  property: propertySchema,
  loanDetails: loanDetailsSchema,
  borrowerDetails: borrowerDetailsSchema,
  employmentHistory: z.array(employmentHistorySchema).min(1),
  assets: z.array(assetSchema),
  liabilities: z.array(liabilitySchema),
});

export const updateMortgageApplicationSchema = z.object({
  status: z.nativeEnum(ApplicationStatus).optional(),
  property: propertySchema.optional(),
  loanDetails: loanDetailsSchema.optional(),
  borrowerDetails: borrowerDetailsSchema.optional(),
  employmentHistory: z.array(employmentHistorySchema).min(1).optional(),
  assets: z.array(assetSchema).optional(),
  liabilities: z.array(liabilitySchema).optional(),
}); 