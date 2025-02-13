"use client"

import { MortgageApplicationProvider } from "@/context/MortgageApplicationContext"
import { PersonalInfo } from "@/components/mortgage/PersonalInfo"
import { PropertyDetails } from "@/components/mortgage/PropertyDetails"
import { IncomeEmployment } from "@/components/mortgage/IncomeEmployment"
import { AssetsLiabilities } from "@/components/mortgage/AssetsLiabilities"
import { Documents } from "@/components/mortgage/Documents"
import { Review } from "@/components/mortgage/Review"
import { useMortgageApplication } from "@/context/MortgageApplicationContext"

function ApplicationSteps() {
  const { currentStep } = useMortgageApplication()

  switch (currentStep) {
    case "personal_info":
      return <PersonalInfo />
    case "property_details":
      return <PropertyDetails />
    case "income_employment":
      return <IncomeEmployment />
    case "assets_liabilities":
      return <AssetsLiabilities />
    case "documents":
      return <Documents />
    case "review":
      return <Review />
    default:
      return <PersonalInfo />
  }
}

export default function ApplicationPage() {
  return (
    <MortgageApplicationProvider>
      <div className="container mx-auto py-6">
        <ApplicationSteps />
      </div>
    </MortgageApplicationProvider>
  )
}
