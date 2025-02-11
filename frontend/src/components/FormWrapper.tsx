import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"

interface FormWrapperProps {
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
}

const FormWrapper = ({ title, description, children, footer }: FormWrapperProps) => {
  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>{children}</CardContent>
        {footer && <CardFooter>{footer}</CardFooter>}
      </Card>
    </div>
  )
}

export default FormWrapper 