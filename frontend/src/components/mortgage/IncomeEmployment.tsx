"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useMortgageApplication } from "@/context/MortgageApplicationContext"

const employmentFormSchema = z.object({
  employerName: z.string().min(1, "Employer name is required"),
  position: z.string().min(1, "Position is required"),
  employmentType: z.enum(["full_time", "part_time", "self_employed", "contractor"]),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  monthlyIncome: z.string().min(1, "Monthly income is required"),
  isCurrent: z.boolean().default(false),
})

type EmploymentFormValues = z.infer<typeof employmentFormSchema>

interface Employment {
  id: string
  employerName: string
  position: string
  employmentType: string
  startDate: string
  endDate?: string
  monthlyIncome: string
  isCurrent: boolean
}

export function IncomeEmployment() {
  const { goToNextStep, goToPreviousStep } = useMortgageApplication()
  const [employments, setEmployments] = useState<Employment[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const form = useForm<EmploymentFormValues>({
    resolver: zodResolver(employmentFormSchema),
    defaultValues: {
      employerName: "",
      position: "",
      employmentType: "full_time",
      startDate: "",
      monthlyIncome: "",
      isCurrent: false,
    },
  })

  function onSubmit(data: EmploymentFormValues) {
    const newEmployment: Employment = {
      id: Math.random().toString(36).substr(2, 9),
      ...data,
    }
    setEmployments([...employments, newEmployment])
    setIsDialogOpen(false)
    form.reset()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Income & Employment</h2>
          <p className="text-muted-foreground">
            Please provide your employment history for the past two years.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add Employment</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add Employment History</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

                <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Position</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your position" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                          <SelectItem value="full_time">Full Time</SelectItem>
                          <SelectItem value="part_time">Part Time</SelectItem>
                          <SelectItem value="self_employed">Self Employed</SelectItem>
                          <SelectItem value="contractor">Contractor</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            {...field} 
                            disabled={form.watch("isCurrent")}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

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
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isCurrent"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Current Employment</FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full">
                  Add Employment
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {employments.length === 0 ? (
          <Card>
            <CardContent className="py-10">
              <div className="text-center text-muted-foreground">
                No employment history added.
                <Button
                  variant="link"
                  onClick={() => setIsDialogOpen(true)}
                  className="ml-2"
                >
                  Add Employment
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          employments.map((employment) => (
            <Card key={employment.id}>
              <CardHeader>
                <CardTitle>{employment.employerName}</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm text-muted-foreground">Position</dt>
                    <dd>{employment.position}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted-foreground">Employment Type</dt>
                    <dd>{employment.employmentType.replace("_", " ").toUpperCase()}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted-foreground">Start Date</dt>
                    <dd>{new Date(employment.startDate).toLocaleDateString()}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted-foreground">End Date</dt>
                    <dd>
                      {employment.isCurrent
                        ? "Current"
                        : employment.endDate
                        ? new Date(employment.endDate).toLocaleDateString()
                        : "-"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted-foreground">Monthly Income</dt>
                    <dd>${parseInt(employment.monthlyIncome).toLocaleString()}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={goToPreviousStep}>
          Previous
        </Button>
        <Button onClick={goToNextStep}>Next</Button>
      </div>
    </div>
  )
}
