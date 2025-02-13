import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SignupFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
}

export function SignupForm() {
  const [formData, setFormData] = useState<SignupFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'buyer'
  });
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signup({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role as 'buyer' | 'lender'
      });
      toast({
        title: 'Success',
        description: 'Account created successfully',
      });
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Signup failed',
        description: error.response?.data?.message || error.message || 'Failed to create account',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleRoleChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      role: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="firstName" className="text-sm font-medium">
          First Name
        </label>
        <Input
          id="firstName"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          required
          placeholder="Enter your first name"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="lastName" className="text-sm font-medium">
          Last Name
        </label>
        <Input
          id="lastName"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          required
          placeholder="Enter your last name"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
          placeholder="Enter your email"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">
          I am a
        </label>
        <Select
          value={formData.role}
          onValueChange={handleRoleChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select your role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="buyer">Home Buyer</SelectItem>
            <SelectItem value="lender">Lender</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium">
          Password
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          required
          placeholder="Create a password"
          minLength={8}
        />
        <p className="text-xs text-muted-foreground">
          Password must be at least 8 characters long
        </p>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Creating account...' : 'Create account'}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <a href="/login" className="text-primary hover:underline">
          Sign in
        </a>
      </p>
    </form>
  );
} 