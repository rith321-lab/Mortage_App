import { useState, useEffect } from "react"

interface FormData {
  [key: string]: any
}

export function useFormProgress<T extends FormData>(formKey: string) {
  const [formData, setFormData] = useState<T | null>(null)

  useEffect(() => {
    // Load saved form data from localStorage
    const savedData = localStorage.getItem(formKey)
    if (savedData) {
      setFormData(JSON.parse(savedData))
    }
  }, [formKey])

  const saveFormProgress = (data: T) => {
    localStorage.setItem(formKey, JSON.stringify(data))
    setFormData(data)
  }

  const clearFormProgress = () => {
    localStorage.removeItem(formKey)
    setFormData(null)
  }

  return {
    formData,
    saveFormProgress,
    clearFormProgress,
  }
} 