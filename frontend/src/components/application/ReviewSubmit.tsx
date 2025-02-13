import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { formatCurrency, formatDate, formatPhoneNumber, formatSSN } from '@/lib/utils';
import { MortgageApplication } from '@/types';

interface ReviewSubmitProps {
  form: UseFormReturn<any>;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

export function ReviewSubmit({ form, onSubmit, isSubmitting = false }: ReviewSubmitProps) {
  const [hasAgreed, setHasAgreed] = React.useState(false);
  const formValues = form.getValues();

  const sections = [
    {
      id: 'property',
      title: 'Property Details',
      content: (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium">Property Address</h4>
              <p className="text-sm text-muted-foreground">
                {formValues.property_details.address.street}<br />
                {formValues.property_details.address.city}, {formValues.property_details.address.state} {formValues.property_details.address.zipCode}
              </p>
            </div>
            <div>
              <h4 className="font-medium">Property Information</h4>
              <p className="text-sm text-muted-foreground">
                Type: {formValues.property_details.propertyType.replace('_', ' ')}<br />
                Purchase Price: {formatCurrency(formValues.property_details.purchasePrice)}<br />
                Down Payment: {formatCurrency(formValues.property_details.downPayment)}<br />
                Estimated Value: {formatCurrency(formValues.property_details.estimatedValue)}
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'borrower',
      title: 'Borrower Details',
      content: (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium">Personal Information</h4>
              <p className="text-sm text-muted-foreground">
                Name: {formValues.borrower_details.firstName} {formValues.borrower_details.lastName}<br />
                Date of Birth: {formatDate(formValues.borrower_details.dateOfBirth)}<br />
                SSN: {formatSSN(formValues.borrower_details.ssn)}<br />
                Phone: {formatPhoneNumber(formValues.borrower_details.phone)}<br />
                Email: {formValues.borrower_details.email}
              </p>
            </div>
            <div>
              <h4 className="font-medium">Current Address</h4>
              <p className="text-sm text-muted-foreground">
                {formValues.borrower_details.currentAddress.street}<br />
                {formValues.borrower_details.currentAddress.city}, {formValues.borrower_details.currentAddress.state} {formValues.borrower_details.currentAddress.zipCode}
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'employment',
      title: 'Employment History',
      content: (
        <div className="space-y-4">
          {formValues.employment_history.map((employment: any, index: number) => (
            <div key={index} className="border-b pb-4 last:border-0">
              <h4 className="font-medium">
                {employment.employerName} - {employment.position}
              </h4>
              <p className="text-sm text-muted-foreground">
                Type: {employment.employmentType.replace('_', ' ')}<br />
                Duration: {formatDate(employment.startDate)} - {employment.endDate ? formatDate(employment.endDate) : 'Present'}<br />
                Monthly Income: {formatCurrency(employment.monthlyIncome)}
              </p>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: 'assets',
      title: 'Assets & Liabilities',
      content: (
        <div className="space-y-6">
          <div>
            <h4 className="font-medium mb-2">Assets</h4>
            <div className="space-y-2">
              {formValues.assets.map((asset: any, index: number) => (
                <div key={index} className="text-sm">
                  <span className="font-medium">{asset.institution}</span> - {asset.type.replace('_', ' ')}<br />
                  <span className="text-muted-foreground">
                    Account: {asset.accountNumber}<br />
                    Value: {formatCurrency(asset.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-2">Liabilities</h4>
            <div className="space-y-2">
              {formValues.liabilities.map((liability: any, index: number) => (
                <div key={index} className="text-sm">
                  <span className="font-medium">{liability.creditor}</span> - {liability.type.replace('_', ' ')}<br />
                  <span className="text-muted-foreground">
                    Monthly Payment: {formatCurrency(liability.monthlyPayment)}<br />
                    Outstanding Balance: {formatCurrency(liability.outstandingBalance)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'loan',
      title: 'Loan Details',
      content: (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium">Loan Information</h4>
              <p className="text-sm text-muted-foreground">
                Type: {formValues.loan_details.loanType.replace('_', ' ')}<br />
                Term: {formValues.loan_details.loanTerm} years<br />
                Purpose: {formValues.loan_details.loanPurpose.replace('_', ' ')}
              </p>
            </div>
            <div>
              <h4 className="font-medium">Financial Details</h4>
              <p className="text-sm text-muted-foreground">
                Loan Amount: {formatCurrency(formValues.loan_details.loan_amount)}<br />
                Interest Rate: {formValues.loan_details.interest_rate}%<br />
                Monthly Payment: {formatCurrency(formValues.loan_details.monthly_payment)}<br />
                Estimated Closing Costs: {formatCurrency(formValues.loan_details.estimated_closing_costs)}
              </p>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Review Your Application</AlertTitle>
        <AlertDescription>
          Please review all information carefully before submitting. Make sure all details are accurate
          and complete. You can go back to previous sections to make changes if needed.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Application Summary</CardTitle>
          <CardDescription>
            Review the details of your mortgage application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <Accordion type="single" collapsible className="w-full">
              {sections.map((section) => (
                <AccordionItem key={section.id} value={section.id}>
                  <AccordionTrigger>{section.title}</AccordionTrigger>
                  <AccordionContent>{section.content}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </ScrollArea>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="terms"
            checked={hasAgreed}
            onCheckedChange={(checked) => setHasAgreed(checked as boolean)}
          />
          <label
            htmlFor="terms"
            className="text-sm text-muted-foreground"
          >
            I confirm that all information provided is accurate and complete. I understand that
            providing false information may result in the rejection of my application and possible
            legal consequences.
          </label>
        </div>

        <Button
          onClick={onSubmit}
          disabled={!hasAgreed || isSubmitting}
          className="w-full"
        >
          {isSubmitting ? (
            <>Submitting Application...</>
          ) : (
            <>Submit Application</>
          )}
        </Button>
      </div>
    </div>
  );
} 