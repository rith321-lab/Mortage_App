"use client"

import React from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { mortgageService } from "@/services/mortgage.service"

const incomeEmploymentSchema = z.object({
  employmentType: z.enum(['full-time', 'part-time', 'self-employed', 'retired'], {
    required_error: 'Please select employment type',
  }),
  employerName: z.string().min(1, 'Employer name is required'),
  monthlyIncome: z.number().min(1, 'Monthly income must be greater than 0'),
  yearsAtJob: z.number().min(0, 'Years at job must be 0 or greater'),
  otherIncome: z.number().optional(),
  otherIncomeSource: z.string().optional(),
})

type IncomeEmploymentFormData = z.infer<typeof incomeEmploymentSchema>

export default function IncomeEmployment() {
  const navigate = useNavigate()

  const form = useForm<IncomeEmploymentFormData>({
    resolver: zodResolver(incomeEmploymentSchema),
    defaultValues: {
      employmentType: 'full-time',
      employerName: '',
      monthlyIncome: 0,
      yearsAtJob: 0,
      otherIncome: 0,
      otherIncomeSource: '',
    },
  })

  const onSubmit = async (data: IncomeEmploymentFormData) => {
    try {
      await mortgageService.updateApplication('current', {
        incomeDetails: data,
      })

      toast({
        title: 'Income details saved',
        description: 'Your income and employment information has been saved successfully.',
      })

      navigate('/assets-liabilities')
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save income details',
      })
    }
  }

  return (
    <div className="container max-w-3xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>Income & Employment</CardTitle>
          <CardDescription>
            Please provide your income and employment information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="employmentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employment Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select employment type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="full-time">Full Time</SelectItem>
                        <SelectItem value="part-time">Part Time</SelectItem>
                        <SelectItem value="self-employed">Self Employed</SelectItem>
                        <SelectItem value="retired">Retired</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="employerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employer Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter employer name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="monthlyIncome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly Income</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter monthly income"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="yearsAtJob"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Years at Current Job</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter years at job"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="otherIncome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Other Monthly Income (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter other income"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="otherIncomeSource"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Other Income Source (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter source of other income"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                >
                  Back
                </Button>
                <Button type="submit">Continue</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
} 