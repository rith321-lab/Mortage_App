"use client"

import React from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useFormProgress } from "@/hooks/useFormProgress"
import { initialApplicationSchema, type InitialApplicationForm } from "@/lib/validations/mortgage-form"
import { useToast } from "@/hooks/useToast"

const InitialApplication = () => {
  const navigate = useNavigate()
  const { addToast } = useToast()
  const { formData, saveFormProgress } = useFormProgress<InitialApplicationForm>("initial-application")

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<InitialApplicationForm>({
    resolver: zodResolver(initialApplicationSchema),
    defaultValues: formData || {},
  })

  const onSubmit = (data: InitialApplicationForm) => {
    try {
      saveFormProgress(data)
      addToast("success", "Progress saved", "Your application progress has been saved")
      navigate("/property-details")
    } catch (error) {
      addToast("error", "Error", "There was an error saving your progress")
    }
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Initial Mortgage Application</CardTitle>
          <CardDescription>Please provide your basic information to start your application.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  {...register("firstName")}
                  className={errors.firstName ? "border-red-500" : ""}
                />
                {errors.firstName && (
                  <p className="text-sm text-red-500 mt-1">{errors.firstName.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  {...register("lastName")}
                  className={errors.lastName ? "border-red-500" : ""}
                />
                {errors.lastName && (
                  <p className="text-sm text-red-500 mt-1">{errors.lastName.message}</p>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                {...register("email")}
                type="email"
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                {...register("phone")}
                type="tel"
                className={errors.phone ? "border-red-500" : ""}
              />
              {errors.phone && (
                <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>
              )}
            </div>
            <div>
              <Label>Loan Purpose</Label>
              <RadioGroup
                defaultValue="purchase"
                onValueChange={(value) => setValue("loanPurpose", value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="purchase" id="purchase" />
                  <Label htmlFor="purchase">Purchase</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="refinance" id="refinance" />
                  <Label htmlFor="refinance">Refinance</Label>
                </div>
              </RadioGroup>
            </div>
            <div>
              <Label>Loan Type</Label>
              <Select onValueChange={(value) => setValue("loanType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select loan type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="conventional">Conventional</SelectItem>
                  <SelectItem value="fha">FHA</SelectItem>
                  <SelectItem value="va">VA</SelectItem>
                  <SelectItem value="usda">USDA</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full">
            Continue to Property Details
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default InitialApplication 