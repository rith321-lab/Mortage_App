"use client"

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { mortgageService, MortgageApplication } from '@/services/mortgage.service';
import { DocumentList } from '@/components/documents/DocumentList';

export default function ReviewSubmit() {
  const navigate = useNavigate();
  const [application, setApplication] = useState<MortgageApplication | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadApplication();
  }, []);

  const loadApplication = async () => {
    try {
      const applications = await mortgageService.getUserApplications();
      const currentApplication = applications.find(app => app.status === 'draft');
      if (currentApplication) {
        setApplication(currentApplication);
      } else {
        toast({
          variant: 'destructive',
          title: 'No draft application found',
          description: 'Please start a new application.',
        });
        navigate('/property-details');
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load application',
      });
    }
  };

  const handleSubmit = async () => {
    if (!application) return;

    try {
      setIsSubmitting(true);
      await mortgageService.submitApplication(application.id!);
      toast({
        title: 'Application submitted',
        description: 'Your mortgage application has been submitted successfully.',
      });
      navigate('/application-submitted');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Submission failed',
        description: error instanceof Error ? error.message : 'Failed to submit application',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!application) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const { propertyDetails, incomeDetails, assets, liabilities } = application;

  return (
    <div className="container max-w-4xl py-8 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Review Your Application</h1>
        <p className="text-gray-600 mt-2">
          Please review all information carefully before submitting your application.
        </p>
      </div>

      {/* Property Details */}
      <Card>
        <CardHeader>
          <CardTitle>Property Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Address</label>
              <p>{propertyDetails.address}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Property Type</label>
              <p className="capitalize">{propertyDetails.propertyType.replace('-', ' ')}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Purchase Price</label>
              <p>${propertyDetails.purchasePrice.toLocaleString()}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Down Payment</label>
              <p>${propertyDetails.downPayment.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Income & Employment */}
      <Card>
        <CardHeader>
          <CardTitle>Income & Employment</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Employment Type</label>
              <p className="capitalize">{incomeDetails.employmentType.replace('-', ' ')}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Employer</label>
              <p>{incomeDetails.employerName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Monthly Income</label>
              <p>${incomeDetails.monthlyIncome.toLocaleString()}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Years at Job</label>
              <p>{incomeDetails.yearsAtJob} years</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assets & Liabilities */}
      <Card>
        <CardHeader>
          <CardTitle>Assets & Liabilities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-medium mb-2">Assets</h4>
              <div className="grid gap-2">
                {assets.map((asset, index) => (
                  <div key={index} className="flex justify-between p-2 bg-gray-50 rounded">
                    <span className="capitalize">{asset.type}</span>
                    <span>${asset.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Liabilities</h4>
              <div className="grid gap-2">
                {liabilities.map((liability, index) => (
                  <div key={index} className="flex justify-between p-2 bg-gray-50 rounded">
                    <span className="capitalize">{liability.type}</span>
                    <span>${liability.outstandingBalance.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents */}
      <Card>
        <CardHeader>
          <CardTitle>Supporting Documents</CardTitle>
          <CardDescription>Review your uploaded documents</CardDescription>
        </CardHeader>
        <CardContent>
          <DocumentList 
            documents={application.documents || []} 
            onDocumentDelete={() => loadApplication()} 
          />
        </CardContent>
      </Card>

      {/* Submit Section */}
      <Card>
        <CardHeader>
          <CardTitle>Ready to Submit?</CardTitle>
          <CardDescription>
            By submitting this application, you confirm that all provided information is accurate and complete.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            disabled={isSubmitting}
          >
            Back
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="min-w-[200px]"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Application'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 