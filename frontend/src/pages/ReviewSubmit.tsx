"use client"

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { getApplicationSummary, submitApplication } from '@/api/mortgage';

export default function ReviewSubmit() {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: summary, isLoading } = useQuery({
    queryKey: ['applicationSummary', applicationId],
    queryFn: () => getApplicationSummary(applicationId!),
    enabled: !!applicationId,
  });

  const submitMutation = useMutation({
    mutationFn: () => submitApplication(applicationId!),
    onSuccess: () => {
      toast({
        title: 'Application Submitted',
        description: 'Your mortgage application has been submitted successfully.',
      });
      navigate(`/application/${applicationId}/status`);
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: error.response?.data?.error || 'Failed to submit application',
      });
      setIsSubmitting(false);
    },
  });

  const handleSubmit = async () => {
    setIsSubmitting(true);
    submitMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <p className="text-muted-foreground">Application not found</p>
      </div>
    );
  }

  const { application } = summary;
  const { metrics, documents = [], ai_analysis: aiAnalysis } = application;

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-8 text-3xl font-bold">Review & Submit Application</h1>

      {/* Application Summary */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h2 className="mb-4 text-xl font-semibold">Property Details</h2>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Purchase Price</dt>
              <dd className="font-medium">
                ${application.property_details.purchase_price.toLocaleString()}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Property Type</dt>
              <dd className="font-medium">{application.property_details.property_type}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Location</dt>
              <dd className="font-medium">{application.property_details.address.city}, {application.property_details.address.state}</dd>
            </div>
          </dl>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-xl font-semibold">Loan Details</h2>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Loan Amount</dt>
              <dd className="font-medium">
                ${application.loan_details.loan_amount.toLocaleString()}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Loan Type</dt>
              <dd className="font-medium">{application.loan_details.loan_type}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Interest Rate</dt>
              <dd className="font-medium">{application.loan_details.interest_rate}%</dd>
            </div>
          </dl>
        </Card>

        {/* Key Metrics */}
        <Card className="p-6">
          <h2 className="mb-4 text-xl font-semibold">Key Metrics</h2>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Debt-to-Income Ratio</dt>
              <dd className="font-medium">{metrics.dti.toFixed(1)}%</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Loan-to-Value Ratio</dt>
              <dd className="font-medium">{metrics.ltv.toFixed(1)}%</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Front-End DTI</dt>
              <dd className="font-medium">{metrics.fedti.toFixed(1)}%</dd>
            </div>
          </dl>
        </Card>

        {/* Document Status */}
        <Card className="p-6">
          <h2 className="mb-4 text-xl font-semibold">Required Documents</h2>
          <ul className="space-y-2">
            {documents.map((doc: any) => (
              <li key={doc.id} className="flex items-center justify-between">
                <span className="text-muted-foreground">{doc.type.replace('_', ' ').toUpperCase()}</span>
                {doc.status === 'verified' ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                )}
              </li>
            ))}
          </ul>
        </Card>

        {/* AI Analysis */}
        {aiAnalysis && (
          <Card className="col-span-2 p-6">
            <h2 className="mb-4 text-xl font-semibold">AI Analysis</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="mb-2 font-medium">Risk Assessment</h3>
                <div className="flex items-center space-x-2">
                  <div className="text-2xl font-bold">{aiAnalysis.risk_score}</div>
                  <div className="text-sm text-muted-foreground">Risk Score</div>
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  Confidence: {(aiAnalysis.confidence_score * 100).toFixed(1)}%
                </div>
              </div>

              <div>
                <h3 className="mb-2 font-medium">Recommendations</h3>
                <ul className="space-y-1 text-sm">
                  {aiAnalysis.recommendations.map((rec: string, index: number) => (
                    <li key={index} className="flex items-center space-x-2">
                      <ArrowRight className="h-4 w-4" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Submit Button */}
      <div className="mt-8 flex justify-end">
        <Button
          size="lg"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Application'
          )}
        </Button>
      </div>
    </div>
  );
} 