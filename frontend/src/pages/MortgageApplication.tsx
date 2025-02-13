"use client"

import React from "react"
import { useQuery } from "@tanstack/react-query"
import { applicationService } from "@/services/application.service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/utils"

export default function MortgageApplication() {
  const { data: application, isLoading } = useQuery({
    queryKey: ["currentApplication"],
    queryFn: applicationService.getCurrentApplication,
  })

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-[200px]" />
          <Skeleton className="h-[200px]" />
          <Skeleton className="h-[200px]" />
          <Skeleton className="h-[200px]" />
        </div>
      </div>
    )
  }

  if (!application) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="py-10">
            <div className="text-center">
              <h3 className="text-lg font-medium">Application not found</h3>
              <p className="text-muted-foreground mt-2">
                Start a new application to begin the mortgage process.
              </p>
              <Button className="mt-4">Start New Application</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Mortgage Application</h1>
          <p className="text-muted-foreground">
            Application ID: {application.id}
          </p>
        </div>
        <Badge
          variant={
            application.status === "approved"
              ? "success"
              : application.status === "rejected"
              ? "destructive"
              : "default"
          }
        >
          {application.status.replace("_", " ").toUpperCase()}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm text-muted-foreground">Name</dt>
                <dd>
                  {application.personalInfo.firstName} {application.personalInfo.lastName}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Email</dt>
                <dd>{application.personalInfo.email}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Phone</dt>
                <dd>{application.personalInfo.phone}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Property Details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm text-muted-foreground">Address</dt>
                <dd>{application.propertyDetails.address}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Property Type</dt>
                <dd>
                  {application.propertyDetails.propertyType.replace("_", " ").toUpperCase()}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Purchase Price</dt>
                <dd>{formatCurrency(application.propertyDetails.purchasePrice)}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Down Payment</dt>
                <dd>{formatCurrency(application.propertyDetails.downPayment)}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Income & Employment</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm text-muted-foreground">Employer</dt>
                <dd>{application.incomeEmployment.employerName}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Monthly Income</dt>
                <dd>{formatCurrency(application.incomeEmployment.monthlyIncome)}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Employment Type</dt>
                <dd>
                  {application.incomeEmployment.employmentType.replace("_", " ").toUpperCase()}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Years at Job</dt>
                <dd>{application.incomeEmployment.yearsAtJob}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Documents</CardTitle>
            <CardDescription>Required documentation for your application</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {application.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div>
                    <p className="font-medium">{doc.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Uploaded {formatDate(doc.uploadedAt)}
                    </p>
                  </div>
                  <Badge
                    variant={
                      doc.status === "verified"
                        ? "success"
                        : doc.status === "rejected"
                        ? "destructive"
                        : "default"
                    }
                  >
                    {doc.status.toUpperCase()}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Application Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative border-l border-muted ml-4">
            {application.timeline.map((event, index) => (
              <div key={index} className="mb-6 ml-6">
                <div className="absolute w-3 h-3 bg-primary rounded-full -left-[19px]" />
                <time className="block mb-1 text-sm font-normal leading-none text-muted-foreground">
                  {formatDate(event.date)}
                </time>
                <h3 className="text-lg font-semibold">
                  {event.status.replace("_", " ").toUpperCase()}
                </h3>
                <p className="text-base font-normal text-muted-foreground">
                  {event.description}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}