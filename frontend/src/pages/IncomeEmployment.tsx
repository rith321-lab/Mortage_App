"use client"

import React from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useQuery, useMutation } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { EmploymentForm } from "@/components/application/EmploymentForm"
import { mortgageService } from "@/services/mortgage.service"
import { useToast } from "@/components/ui/use-toast"

const employmentSchema = z.object({
  employment_history: z.array(z.object({
    employerName: z.string().min(1, 'Employer name is required'),
    position: z.string().min(1, 'Position is required'),
    employmentType: z.string().min(1, 'Employment type is required'),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().optional(),
    monthlyIncome: z.number().min(1, 'Monthly income is required'),
  })),
})

type EmploymentFormData = z.infer<typeof employmentSchema>

export default function IncomeEmployment() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()

  const form = useForm<EmploymentFormData>({
    resolver: zodResolver(employmentSchema),
    defaultValues: {
      employment_history: [],
    },
  })

  const { data: application } = useQuery({
    queryKey: ['application', id],
    queryFn: () => mortgageService.getApplication(id!),
    enabled: !!id,
    onSuccess: (data) => {
      if (data.employment_history) {
        form.reset({ employment_history: data.employment_history })
      }
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: EmploymentFormData) =>
      mortgageService.updateApplication(id!, { employment_history: data.employment_history }),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Employment information saved successfully',
      })
      navigate(`/application/${id}/assets-liabilities`)
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to save employment information. Please try again.',
        variant: 'destructive',
      })
    },
  })

  const onSubmit = (data: EmploymentFormData) => {
    updateMutation.mutate(data)
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Income & Employment</CardTitle>
          <CardDescription>
            Please provide your employment history for the past two years
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <EmploymentForm form={form} />
            
            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/application/${id}/borrower-details`)}
              >
                Previous
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Saving...' : 'Next'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 