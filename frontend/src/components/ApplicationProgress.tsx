import React from "react"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ApplicationProgressProps {
  currentStep: number
  totalSteps: number
  stepName: string
}

const ApplicationProgress = ({ currentStep, totalSteps, stepName }: ApplicationProgressProps) => {
  const progress = (currentStep / totalSteps) * 100

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Application Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <Progress value={progress} className="mb-2" />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Step {currentStep} of {totalSteps}</span>
          <span>{stepName}</span>
        </div>
      </CardContent>
    </Card>
  )
}

export default ApplicationProgress 