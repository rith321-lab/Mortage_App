import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PropertyDetailsForm } from './PropertyDetailsForm';
import { BorrowerDetailsForm } from './BorrowerDetailsForm';
import { EmploymentForm } from './EmploymentForm';
import { AssetsLiabilitiesForm } from './AssetsLiabilitiesForm';
import { LoanDetailsForm } from './LoanDetailsForm';
import { DocumentsForm } from './DocumentsForm';
import { ReviewSubmit } from './ReviewSubmit';
import { MortgageApplication } from '@/types';
import { createApplication, updateApplication } from '@/services/mortgage.service';
import { useToast } from '@/hooks/useToast';

const formSchema = z.object({
  property_details: z.object({
    address: z.object({
      street: z.string().min(1, 'Street address is required'),
      city: z.string().min(1, 'City is required'),
      state: z.string().length(2, 'Please use 2-letter state code'),
      zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code'),
    }),
    propertyType: z.enum(['single_family', 'multi_family', 'condo', 'townhouse']),
    purchasePrice: z.number().positive('Purchase price must be greater than 0'),
    downPayment: z.number().positive('Down payment must be greater than 0'),
    estimatedValue: z.number().positive('Estimated value must be greater than 0'),
  }),
  borrower_details: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    dateOfBirth: z.string().datetime(),
    ssn: z.string().regex(/^\d{3}-\d{2}-\d{4}$/, 'Invalid SSN format'),
    phone: z.string().regex(/^\+?1?\d{10}$/, 'Invalid phone number'),
    email: z.string().email('Invalid email address'),
    currentAddress: z.object({
      street: z.string().min(1, 'Street address is required'),
      city: z.string().min(1, 'City is required'),
      state: z.string().length(2, 'Please use 2-letter state code'),
      zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code'),
    }),
  }),
  employment_history: z.array(z.object({
    employerName: z.string().min(1, 'Employer name is required'),
    position: z.string().min(1, 'Position is required'),
    startDate: z.string().datetime(),
    endDate: z.string().datetime().optional(),
    monthlyIncome: z.number().positive('Monthly income must be greater than 0'),
    employmentType: z.enum(['full_time', 'part_time', 'self_employed', 'retired']),
  })).min(1, 'At least one employment record is required'),
  assets: z.array(z.object({
    type: z.enum(['checking', 'savings', 'investment', 'retirement', 'other']),
    institution: z.string().min(1, 'Institution name is required'),
    accountNumber: z.string().min(1, 'Account number is required'),
    value: z.number().positive('Value must be greater than 0'),
  })),
  liabilities: z.array(z.object({
    type: z.enum(['credit_card', 'car_loan', 'student_loan', 'other']),
    creditor: z.string().min(1, 'Creditor name is required'),
    monthlyPayment: z.number().positive('Monthly payment must be greater than 0'),
    outstandingBalance: z.number().positive('Outstanding balance must be greater than 0'),
    accountNumber: z.string().optional(),
  })),
  loan_details: z.object({
    loanType: z.enum(['conventional', 'fha', 'va', 'jumbo']),
    loanTerm: z.enum(['15', '30']),
    loanPurpose: z.enum(['purchase', 'refinance']),
    loan_amount: z.number().positive('Loan amount must be greater than 0'),
    interest_rate: z.number().optional(),
    monthly_payment: z.number().optional(),
    estimated_closing_costs: z.number().optional(),
  }),
});

type FormData = z.infer<typeof formSchema>;

interface ApplicationFormProps {
  initialData?: Partial<MortgageApplication>;
  onComplete?: (application: MortgageApplication) => void;
}

export function ApplicationForm({ initialData, onComplete }: ApplicationFormProps) {
  const [activeTab, setActiveTab] = React.useState('property');
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      property_details: initialData?.property_details || {
        address: { street: '', city: '', state: '', zipCode: '' },
        propertyType: 'single_family',
        purchasePrice: 0,
        downPayment: 0,
        estimatedValue: 0,
      },
      borrower_details: initialData?.borrower_details || {
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        ssn: '',
        phone: '',
        email: '',
        currentAddress: { street: '', city: '', state: '', zipCode: '' },
      },
      employment_history: initialData?.employment_history || [],
      assets: initialData?.assets || [],
      liabilities: initialData?.liabilities || [],
      loan_details: initialData?.loan_details || {
        loanType: 'conventional',
        loanTerm: '30',
        loanPurpose: 'purchase',
        loan_amount: 0,
      },
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const application = initialData?.id
        ? await updateApplication(initialData.id, data)
        : await createApplication(data);

      toast({
        title: 'Success',
        description: initialData?.id
          ? 'Application updated successfully'
          : 'Application created successfully',
      });

      onComplete?.(application);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save application',
        variant: 'destructive',
      });
    }
  };

  const tabs = [
    { id: 'property', label: 'Property Details', component: PropertyDetailsForm },
    { id: 'borrower', label: 'Borrower Details', component: BorrowerDetailsForm },
    { id: 'employment', label: 'Employment', component: EmploymentForm },
    { id: 'assets', label: 'Assets & Liabilities', component: AssetsLiabilitiesForm },
    { id: 'loan', label: 'Loan Details', component: LoanDetailsForm },
    { id: 'documents', label: 'Documents', component: DocumentsForm },
    { id: 'review', label: 'Review & Submit', component: ReviewSubmit },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-7 w-full">
              {tabs.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {tabs.map((tab) => (
              <TabsContent key={tab.id} value={tab.id}>
                <tab.component form={form} />
              </TabsContent>
            ))}
          </Tabs>

          <div className="flex justify-between mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const currentIndex = tabs.findIndex((tab) => tab.id === activeTab);
                if (currentIndex > 0) {
                  setActiveTab(tabs[currentIndex - 1].id);
                }
              }}
              disabled={activeTab === tabs[0].id}
            >
              Previous
            </Button>

            {activeTab === 'review' ? (
              <Button type="submit">Submit Application</Button>
            ) : (
              <Button
                type="button"
                onClick={() => {
                  const currentIndex = tabs.findIndex((tab) => tab.id === activeTab);
                  if (currentIndex < tabs.length - 1) {
                    setActiveTab(tabs[currentIndex + 1].id);
                  }
                }}
                disabled={activeTab === tabs[tabs.length - 1].id}
              >
                Next
              </Button>
            )}
          </div>
        </Card>
      </form>
    </Form>
  );
} 