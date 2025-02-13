import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LoanType } from '@/types';
import { calculateLTV } from '@/lib/utils';

interface LoanDetailsFormProps {
  form: UseFormReturn<any>;
}

const loanTypes: { value: LoanType; label: string }[] = [
  { value: 'conventional', label: 'Conventional' },
  { value: 'fha', label: 'FHA' },
  { value: 'va', label: 'VA' },
  { value: 'jumbo', label: 'Jumbo' },
];

const loanTerms = [
  { value: '15', label: '15 Years' },
  { value: '30', label: '30 Years' },
];

const loanPurposes = [
  { value: 'purchase', label: 'Purchase' },
  { value: 'refinance', label: 'Refinance' },
];

export function LoanDetailsForm({ form }: LoanDetailsFormProps) {
  // Watch property value and loan amount to calculate LTV
  const propertyValue = form.watch('property_details.estimatedValue');
  const loanAmount = form.watch('loan_details.loan_amount');
  const ltv = propertyValue && loanAmount ? calculateLTV(loanAmount, propertyValue) : 0;

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Loan Information</h3>
        
        <div className="grid gap-4">
          <FormField
            control={form.control}
            name="loan_details.loanType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Loan Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select loan type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {loanTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="loan_details.loanTerm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Loan Term</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select loan term" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {loanTerms.map((term) => (
                      <SelectItem key={term.value} value={term.value}>
                        {term.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="loan_details.loanPurpose"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Loan Purpose</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select loan purpose" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {loanPurposes.map((purpose) => (
                      <SelectItem key={purpose.value} value={purpose.value}>
                        {purpose.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="loan_details.loan_amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Loan Amount</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="loan_details.interest_rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Interest Rate (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.125"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="loan_details.monthly_payment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estimated Monthly Payment</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="loan_details.estimated_closing_costs"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estimated Closing Costs</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {ltv > 0 && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Loan-to-Value (LTV) Ratio:</span>
              <span className={`text-sm font-bold ${
                ltv > 95 ? 'text-destructive' :
                ltv > 80 ? 'text-warning' :
                'text-success'
              }`}>
                {ltv.toFixed(2)}%
              </span>
            </div>
            {ltv > 80 && (
              <p className="text-xs text-muted-foreground mt-2">
                {ltv > 95
                  ? 'LTV ratio is very high. Additional down payment may be required.'
                  : 'LTV ratio above 80% may require private mortgage insurance (PMI).'}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 