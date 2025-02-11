import React from "react"
import { Label } from "@/components/ui/label"
import FormError from "@/components/FormError"

interface FormFieldProps {
  label: string
  error?: string
  children: React.ReactNode
  htmlFor?: string
}

const FormField = ({ label, error, children, htmlFor }: FormFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      <FormError message={error} />
    </div>
  )
}

export default FormField 