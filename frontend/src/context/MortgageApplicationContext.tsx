"use client"

import React, { createContext, useContext, useState } from "react"

type ApplicationStep = 
  | "personal_info"
  | "property_details"
  | "income_employment"
  | "assets_liabilities"
  | "documents"
  | "review"

interface MortgageApplicationContextType {
  currentStep: ApplicationStep
  setCurrentStep: (step: ApplicationStep) => void
  goToNextStep: () => void
  goToPreviousStep: () => void
  canGoNext: boolean
  canGoPrevious: boolean
}

const steps: ApplicationStep[] = [
  "personal_info",
  "property_details",
  "income_employment",
  "assets_liabilities",
  "documents",
  "review"
]

const MortgageApplicationContext = createContext<MortgageApplicationContextType | undefined>(undefined)

export function MortgageApplicationProvider({ children }: { children: React.ReactNode }) {
  const [currentStep, setCurrentStep] = useState<ApplicationStep>("personal_info")

  const currentIndex = steps.indexOf(currentStep)
  const canGoNext = currentIndex < steps.length - 1
  const canGoPrevious = currentIndex > 0

  const goToNextStep = () => {
    if (canGoNext) {
      setCurrentStep(steps[currentIndex + 1])
    }
  }

  const goToPreviousStep = () => {
    if (canGoPrevious) {
      setCurrentStep(steps[currentIndex - 1])
    }
  }

  return (
    <MortgageApplicationContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        goToNextStep,
        goToPreviousStep,
        canGoNext,
        canGoPrevious,
      }}
    >
      {children}
    </MortgageApplicationContext.Provider>
  )
}

export function useMortgageApplication() {
  const context = useContext(MortgageApplicationContext)
  if (context === undefined) {
    throw new Error("useMortgageApplication must be used within a MortgageApplicationProvider")
  }
  return context
}
