import React from 'react';
import { UseFormReturn, useFieldArray } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { AssetType, LiabilityType } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface AssetsLiabilitiesFormProps {
  form: UseFormReturn<any>;
}

const assetTypes: { value: AssetType; label: string }[] = [
  { value: 'checking', label: 'Checking Account' },
  { value: 'savings', label: 'Savings Account' },
  { value: 'investment', label: 'Investment Account' },
  { value: 'retirement', label: 'Retirement Account' },
  { value: 'other', label: 'Other' },
];

const liabilityTypes: { value: LiabilityType; label: string }[] = [
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'car_loan', label: 'Car Loan' },
  { value: 'student_loan', label: 'Student Loan' },
  { value: 'other', label: 'Other' },
];

export function AssetsLiabilitiesForm({ form }: AssetsLiabilitiesFormProps) {
  const assets = useFieldArray({
    control: form.control,
    name: 'assets',
  });

  const liabilities = useFieldArray({
    control: form.control,
    name: 'liabilities',
  });

  const addAsset = () => {
    assets.append({
      type: 'checking',
      institution: '',
      accountNumber: '',
      value: 0,
    });
  };

  const addLiability = () => {
    liabilities.append({
      type: 'credit_card',
      creditor: '',
      monthlyPayment: 0,
      outstandingBalance: 0,
      accountNumber: '',
    });
  };

  const calculateTotalAssets = () => {
    return form.watch('assets').reduce(
      (total: number, asset: any) => total + (asset.value || 0),
      0
    );
  };

  const calculateTotalLiabilities = () => {
    return form.watch('liabilities').reduce(
      (total: number, liability: any) => total + (liability.outstandingBalance || 0),
      0
    );
  };

  return (
    <div className="space-y-8">
      {/* Assets Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Assets</h3>
            <p className="text-sm text-muted-foreground">
              Total Assets: {formatCurrency(calculateTotalAssets())}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addAsset}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Asset
          </Button>
        </div>

        {assets.fields.map((field, index) => (
          <div key={field.id} className="space-y-4 p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Asset {index + 1}</h4>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => assets.remove(index)}
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>

            <div className="grid gap-4">
              <FormField
                control={form.control}
                name={`assets.${index}.type`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asset Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {assetTypes.map((type) => (
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

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name={`assets.${index}.institution`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Institution</FormLabel>
                      <FormControl>
                        <Input placeholder="Bank Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`assets.${index}.accountNumber`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Number</FormLabel>
                      <FormControl>
                        <Input placeholder="XXXX-XXXX" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name={`assets.${index}.value`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Value</FormLabel>
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
          </div>
        ))}

        {assets.fields.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>No assets added.</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addAsset}
              className="mt-2"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Asset
            </Button>
          </div>
        )}
      </div>

      {/* Liabilities Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Liabilities</h3>
            <p className="text-sm text-muted-foreground">
              Total Liabilities: {formatCurrency(calculateTotalLiabilities())}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addLiability}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Liability
          </Button>
        </div>

        {liabilities.fields.map((field, index) => (
          <div key={field.id} className="space-y-4 p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Liability {index + 1}</h4>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => liabilities.remove(index)}
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>

            <div className="grid gap-4">
              <FormField
                control={form.control}
                name={`liabilities.${index}.type`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Liability Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {liabilityTypes.map((type) => (
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

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name={`liabilities.${index}.creditor`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Creditor</FormLabel>
                      <FormControl>
                        <Input placeholder="Creditor Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`liabilities.${index}.accountNumber`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Number</FormLabel>
                      <FormControl>
                        <Input placeholder="XXXX-XXXX" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name={`liabilities.${index}.monthlyPayment`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly Payment</FormLabel>
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

                <FormField
                  control={form.control}
                  name={`liabilities.${index}.outstandingBalance`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Outstanding Balance</FormLabel>
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
            </div>
          </div>
        ))}

        {liabilities.fields.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>No liabilities added.</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addLiability}
              className="mt-2"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Liability
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 