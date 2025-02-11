"use client"

import React from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"

export function ApplicationSubmitted() {
  const navigate = useNavigate()

  return (
    <div className="container max-w-lg min-h-screen flex items-center justify-center py-8">
      <Card className="w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Application Submitted!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            Thank you for submitting your mortgage application. Our team will review your application
            and contact you within 2-3 business days.
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">What's Next?</h4>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Our team will review your application and documents</li>
              <li>• We may contact you for additional information</li>
              <li>• You'll receive updates via email about your application status</li>
              <li>• A mortgage advisor will be assigned to guide you through the process</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center space-x-4">
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard')}
          >
            Go to Dashboard
          </Button>
          <Button
            onClick={() => window.location.href = 'mailto:support@example.com'}
          >
            Contact Support
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default ApplicationSubmitted 