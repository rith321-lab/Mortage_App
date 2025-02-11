import React from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function Dashboard() {
  const navigate = useNavigate()

  const handleClick = (path: string) => {
    console.log(`Attempting to navigate to: ${path}`)
    try {
      navigate(path, { replace: true })
    } catch (error) {
      console.error('Navigation error:', error)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Mortgage Application Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">Property Details</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Status: Not Started</p>
            <Button 
              onClick={() => handleClick('/property-details')}
              className="w-full"
              variant="default"
            >
              Start
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Status: Not Started</p>
            <Button 
              onClick={() => handleClick('/documents')}
              className="w-full"
            >
              Start
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">Income & Employment</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Status: Not Started</p>
            <Button 
              onClick={() => handleClick('/income-employment')}
              className="w-full"
            >
              Start
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">Assets & Liabilities</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Status: Not Started</p>
            <Button 
              onClick={() => handleClick('/assets-liabilities')}
              className="w-full"
            >
              Start
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">Review & Submit</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Status: Not Started</p>
            <Button 
              onClick={() => handleClick('/review-submit')}
              className="w-full"
            >
              Start
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 