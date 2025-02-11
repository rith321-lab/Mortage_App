import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Circle, Clock, FileText, Loader2 } from "lucide-react";

const Status = () => {
  // Mock data - would come from your application state/API
  const applicationSteps = [
    {
      title: "Application Submitted",
      description: "Your mortgage application has been received",
      status: "completed",
      date: "March 15, 2024",
    },
    {
      title: "Document Review",
      description: "We're reviewing your submitted documents",
      status: "in-progress",
      date: "March 16, 2024",
    },
    {
      title: "Underwriting",
      description: "Application is being reviewed by our underwriting team",
      status: "pending",
      date: "Pending",
    },
    {
      title: "Final Approval",
      description: "Final decision on your mortgage application",
      status: "pending",
      date: "Pending",
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <Check className="h-6 w-6 text-green-500" />;
      case "in-progress":
        return <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />;
      default:
        return <Circle className="h-6 w-6 text-gray-300" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <FileText className="h-8 w-8" />
        <h1 className="text-3xl font-bold">Application Status</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Application Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {applicationSteps.map((step, index) => (
              <div key={index} className="relative">
                {/* Connector line */}
                {index < applicationSteps.length - 1 && (
                  <div className="absolute left-[1.125rem] top-12 h-full w-0.5 bg-gray-200" />
                )}
                
                <div className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getStatusIcon(step.status)}
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{step.title}</h3>
                        <p className="text-muted-foreground">{step.description}</p>
                      </div>
                      <span className="text-sm text-muted-foreground">{step.date}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Status; 