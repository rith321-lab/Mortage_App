import React from "react"
import { Check, Circle } from "lucide-react"
import { cn } from "@/lib/utils"

interface Step {
  id: number
  label: string
  completed: boolean
  current: boolean
}

interface FormStepIndicatorProps {
  steps: Step[]
  className?: string
}

const FormStepIndicator = ({ steps, className }: FormStepIndicatorProps) => {
  return (
    <div className={cn("flex items-center justify-center space-x-4", className)}>
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <div className="flex items-center">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full border-2",
                {
                  "border-primary bg-primary text-primary-foreground": step.completed,
                  "border-primary": step.current,
                  "border-muted": !step.completed && !step.current,
                }
              )}
            >
              {step.completed ? (
                <Check className="h-4 w-4" />
              ) : (
                <span className="text-sm font-medium">{step.id}</span>
              )}
            </div>
            <span
              className={cn("ml-2 text-sm font-medium", {
                "text-primary": step.current,
                "text-muted-foreground": !step.current,
              })}
            >
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={cn("h-0.5 w-16", {
                "bg-primary": step.completed,
                "bg-muted": !step.completed,
              })}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

export default FormStepIndicator 