"use client"

import React from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { mortgageService } from "@/services/mortgage.service"

// Rename the interface to avoid conflict
interface PropertyDetailsData {
  address: string
  propertyType: 'single-family' | 'multi-family' | 'condo' | 'townhouse'
  purchasePrice: number
  downPayment: number
  estimatedValue: number
  occupancyType: 'primary' | 'secondary' | 'investment'
}

const propertyDetailsSchema = z.object({
  address: z.string().min(1, "Address is required"),
  propertyType: z.enum(["single-family", "multi-family", "condo", "townhouse"], {
    required_error: "Please select a property type",
  }),
  purchasePrice: z.number().min(1, "Purchase price must be greater than 0"),
  downPayment: z.number().min(1, "Down payment must be greater than 0"),
  estimatedValue: z.number().min(1, "Estimated value must be greater than 0"),
  occupancyType: z.enum(["primary", "secondary", "investment"], {
    required_error: "Please select an occupancy type",
  }),
})

type PropertyDetailsFormData = z.infer<typeof propertyDetailsSchema>

export default function PropertyDetails() {
  const navigate = useNavigate()
  const form = useForm<PropertyDetailsFormData>({
    resolver: zodResolver(propertyDetailsSchema),
    defaultValues: {
      address: "",
      propertyType: "single-family",
      purchasePrice: 0,
      downPayment: 0,
      estimatedValue: 0,
      occupancyType: "primary",
    },
  })

  const onSubmit = async (data: PropertyDetailsFormData) => {
    try {
      await mortgageService.createApplication({
        propertyDetails: data,
      })

      toast({
        title: "Property details saved",
        description: "Your property information has been saved successfully.",
      })
      
      // Navigate to the next step
      navigate("/documents")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save property details",
      })
    }
  }

  return (
    <div className="container max-w-3xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>Property Details</CardTitle>
          <CardDescription>
            Please provide information about the property you wish to purchase.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter the property address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="propertyType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select property type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="single-family">Single Family</SelectItem>
                        <SelectItem value="multi-family">Multi Family</SelectItem>
                        <SelectItem value="condo">Condominium</SelectItem>
                        <SelectItem value="townhouse">Townhouse</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="purchasePrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Purchase Price</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter purchase price"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="downPayment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Down Payment</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter down payment"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="estimatedValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Value</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter estimated value"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="occupancyType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Occupancy Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select occupancy type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="primary">Primary Residence</SelectItem>
                        <SelectItem value="secondary">Secondary Home</SelectItem>
                        <SelectItem value="investment">Investment Property</SelectItem>
                      </SelectContent>
                    </Select>
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