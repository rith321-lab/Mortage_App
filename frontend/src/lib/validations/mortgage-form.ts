import * as z from "zod"

export const initialApplicationSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^\d{10}$/, "Phone number must be 10 digits"),
  loanPurpose: z.enum(["purchase", "refinance"], {
    required_error: "Please select a loan purpose",
  }),
  loanType: z.enum(["conventional", "fha", "va", "usda"], {
    required_error: "Please select a loan type",
  }),
})

export const propertyDetailsSchema = z.object({
  propertyType: z.enum(["single-family", "multi-family", "condo", "townhouse"], {
    required_error: "Please select a property type",
  }),
  propertyUse: z.enum(["primary", "secondary", "investment"], {
    required_error: "Please select property use",
  }),
  address: z.string().min(5, "Please enter a valid address"),
  city: z.string().min(2, "Please enter a valid city"),
  state: z.string().length(2, "Please enter a valid state abbreviation"),
  zipCode: z.string().regex(/^\d{5}$/, "ZIP code must be 5 digits"),
  estimatedValue: z.number().min(1, "Please enter a valid amount"),
})

export const incomeEmploymentSchema = z.object({
  employmentStatus: z.enum(["full-time", "part-time", "self-employed", "unemployed", "retired"], {
    required_error: "Please select employment status",
  }),
  employerName: z.string().min(2, "Please enter employer name"),
  jobTitle: z.string().min(2, "Please enter job title"),
  yearsAtJob: z.number().min(0, "Please enter valid years"),
  annualIncome: z.number().min(1, "Please enter valid income"),
  otherIncome: z.number().optional(),
})

export const assetsLiabilitiesSchema = z.object({
  checkingSavings: z.number().min(0, "Please enter valid amount"),
  investments: z.number().min(0, "Please enter valid amount"),
  otherAssets: z.number().min(0, "Please enter valid amount"),
  creditCardDebt: z.number().min(0, "Please enter valid amount"),
  carLoans: z.number().min(0, "Please enter valid amount"),
  studentLoans: z.number().min(0, "Please enter valid amount"),
  otherDebts: z.number().min(0, "Please enter valid amount"),
})

export type InitialApplicationForm = z.infer<typeof initialApplicationSchema>
export type PropertyDetailsForm = z.infer<typeof propertyDetailsSchema>
export type IncomeEmploymentForm = z.infer<typeof incomeEmploymentSchema>
export type AssetsLiabilitiesForm = z.infer<typeof assetsLiabilitiesSchema> 