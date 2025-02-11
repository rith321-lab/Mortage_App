import React from "react"
import { Loader2 } from "lucide-react"

interface LoadingSpinnerProps {
  size?: number
  className?: string
}

const LoadingSpinner = ({ size = 24, className = "" }: LoadingSpinnerProps) => {
  return (
    <div className="flex items-center justify-center">
      <Loader2 className={`animate-spin ${className}`} size={size} />
    </div>
  )
}

export default LoadingSpinner 