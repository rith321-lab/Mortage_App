"use client"

import React from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useFormProgress } from "@/hooks/useFormProgress"
import { useToast } from "@/hooks/useToast"

const assetSchema = z.object({
  type: z.enum(['checking', 'savings', 'investment', 'retirement', 'other'], {
    required_error: 'Please select asset type',
  }),
  institution: z.string().min(1, 'Institution name is required'),
  accountNumber: z.string().min(1, 'Account number is required'),
  value: z.number().min(0, 'Value must be 0 or greater'),
  description: z.string().optional(),
})

const liabilitySchema = z.object({
  type: z.enum(['credit-card', 'car-loan', 'student-loan', 'other'], {
    required_error: 'Please select liability type',
  }),
  creditor: z.string().min(1, 'Creditor name is required'),
  accountNumber: z.string().min(1, 'Account number is required'),
  monthlyPayment: z.number().min(0, 'Monthly payment must be 0 or greater'),
  outstandingBalance: z.number().min(0, 'Outstanding balance must be 0 or greater'),
  description: z.string().optional(),
})

const assetsLiabilitiesSchema = z.object({
  checkingSavings: z.number().min(0, 'Value must be 0 or greater'),
  investments: z.number().min(0, 'Value must be 0 or greater'),
  otherAssets: z.number().min(0, 'Value must be 0 or greater'),
  creditCardDebt: z.number().min(0, 'Value must be 0 or greater'),
  carLoans: z.number().min(0, 'Value must be 0 or greater'),
  studentLoans: z.number().min(0, 'Value must be 0 or greater'),
  otherDebts: z.number().min(0, 'Value must be 0 or greater'),
})

type AssetsLiabilitiesForm = z.infer<typeof assetsLiabilitiesSchema>

export default function AssetsLiabilities() {
  const navigate = useNavigate()
  const { addToast } = useToast()
  const { formData, saveFormProgress } = useFormProgress<AssetsLiabilitiesForm>("assets-liabilities")

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<AssetsLiabilitiesForm>({
    resolver: zodResolver(assetsLiabilitiesSchema),
    defaultValues: formData || {},
  })

  const onSubmit = (data: AssetsLiabilitiesForm) => {
    try {
      saveFormProgress(data)
      addToast("success", "Progress saved", "Assets and liabilities have been saved")
      navigate("/review-submit")
    } catch (error) {
      addToast("error", "Error", "There was an error saving your progress")
    }
  }

  // Calculate totals
  const values = watch()
  const totalAssets = (Number(values.checkingSavings) || 0) + 
                     (Number(values.investments) || 0) + 
                     (Number(values.otherAssets) || 0)
  const totalLiabilities = (Number(values.creditCardDebt) || 0) + 
                          (Number(values.carLoans) || 0) + 
                          (Number(values.studentLoans) || 0) + 
                          (Number(values.otherDebts) || 0)
  const netWorth = totalAssets - totalLiabilities

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Assets & Liabilities</CardTitle>
          <CardDescription>Please provide information about your assets and liabilities.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Assets</h3>
              <div>
                <Label htmlFor="checkingSavings">Checking & Savings Accounts</Label>
                <Input
                  id="checkingSavings"
                  type="number"
                  {...register("checkingSavings", { valueAsNumber: true })}
                  className={errors.checkingSavings ? "border-red-500" : ""}
                />
                {errors.checkingSavings && (
                  <p className="text-sm text-red-500 mt-1">{errors.checkingSavings.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="investments">Investments</Label>
                <Input
                  id="investments"
                  type="number"
                  {...register("investments", { valueAsNumber: true })}
                  className={errors.investments ? "border-red-500" : ""}
                />
                {errors.investments && (
                  <p className="text-sm text-red-500 mt-1">{errors.investments.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="otherAssets">Other Assets</Label>
                <Input
                  id="otherAssets"
                  type="number"
                  {...register("otherAssets", { valueAsNumber: true })}
                  className={errors.otherAssets ? "border-red-500" : ""}
                />
                {errors.otherAssets && (
                  <p className="text-sm text-red-500 mt-1">{errors.otherAssets.message}</p>
                )}
              </div>

              <div className="text-right text-sm text-muted-foreground">
                Total Assets: ${totalAssets.toLocaleString()}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Liabilities</h3>
              <div>
                <Label htmlFor="creditCardDebt">Credit Card Debt</Label>
                <Input
                  id="creditCardDebt"
                  type="number"
                  {...register("creditCardDebt", { valueAsNumber: true })}
                  className={errors.creditCardDebt ? "border-red-500" : ""}
                />
                {errors.creditCardDebt && (
                  <p className="text-sm text-red-500 mt-1">{errors.creditCardDebt.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="carLoans">Car Loans</Label>
                <Input
                  id="carLoans"
                  type="number"
                  {...register("carLoans", { valueAsNumber: true })}
                  className={errors.carLoans ? "border-red-500" : ""}
                />
                {errors.carLoans && (
                  <p className="text-sm text-red-500 mt-1">{errors.carLoans.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="studentLoans">Student Loans</Label>
                <Input
                  id="studentLoans"
                  type="number"
                  {...register("studentLoans", { valueAsNumber: true })}
                  className={errors.studentLoans ? "border-red-500" : ""}
                />
                {errors.studentLoans && (
                  <p className="text-sm text-red-500 mt-1">{errors.studentLoans.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="otherDebts">Other Debts</Label>
                <Input
                  id="otherDebts"
                  type="number"
                  {...register("otherDebts", { valueAsNumber: true })}
                  className={errors.otherDebts ? "border-red-500" : ""}
                />
                {errors.otherDebts && (
                  <p className="text-sm text-red-500 mt-1">{errors.otherDebts.message}</p>
                )}
              </div>

              <div className="text-right text-sm text-muted-foreground">
                Total Liabilities: ${totalLiabilities.toLocaleString()}
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="text-right font-semibold">
                Net Worth: ${netWorth.toLocaleString()}
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" onClick={handleSubmit(onSubmit)}>
            Continue to Review & Submit
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
} 