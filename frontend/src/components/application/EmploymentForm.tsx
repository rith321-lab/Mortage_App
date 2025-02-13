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
import { EmploymentType } from '@/types';

interface EmploymentFormProps {
  form: UseFormReturn<any>;
}

const employmentTypes: { value: EmploymentType; label: string }[] = [
  { value: 'full_time', label: 'Full Time' },
  { value: 'part_time', label: 'Part Time' },
  { value: 'self_employed', label: 'Self Employed' },
  { value: 'retired', label: 'Retired' },
];

export function EmploymentForm({ form }: EmploymentFormProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'employment_history',
  });

  const addEmployment = () => {
    append({
      employerName: '',
      position: '',
      startDate: '',
      endDate: '',
      monthlyIncome: 0,
      employmentType: 'full_time',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Employment History</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addEmployment}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Employment
        </Button>
      </div>

      {fields.map((field, index) => (
        <div key={field.id} className="space-y-4 p-4 border rounded-lg">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Employment {index + 1}</h4>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => remove(index)}
            >
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>

          <div className="grid gap-4">
            <FormField
              control={form.control}
              name={`employment_history.${index}.employerName`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employer Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Company Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name={`employment_history.${index}.position`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Position</FormLabel>
                    <FormControl>
                      <Input placeholder="Job Title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`employment_history.${index}.employmentType`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employment Type</FormLabel>
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
                        {employmentTypes.map((type) => (
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name={`employment_history.${index}.startDate`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`employment_history.${index}.endDate`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        placeholder="Leave blank if current"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name={`employment_history.${index}.monthlyIncome`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monthly Income</FormLabel>
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

      {fields.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No employment history added.</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addEmployment}
            className="mt-2"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Employment
          </Button>
        </div>
      )}
    </div>
  );
} 