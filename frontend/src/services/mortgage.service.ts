import { api } from '@/lib/api';
import { Document } from './document.service';

export interface PropertyDetails {
  address: string;
  propertyType: string;
  purchasePrice: number;
  downPayment: number;
  estimatedValue: number;
  occupancyType: string;
}

export interface IncomeDetails {
  employmentType: 'full-time' | 'part-time' | 'self-employed' | 'retired';
  employerName: string;
  monthlyIncome: number;
  yearsAtJob: number;
  otherIncome?: number;
  otherIncomeSource?: string;
}

export interface Asset {
  type: 'checking' | 'savings' | 'investment' | 'retirement' | 'other';
  institution: string;
  accountNumber: string;
  value: number;
  description?: string;
}

export interface Liability {
  type: 'credit-card' | 'car-loan' | 'student-loan' | 'other';
  creditor: string;
  accountNumber: string;
  monthlyPayment: number;
  outstandingBalance: number;
  description?: string;
}

export interface MortgageApplication {
  id?: string;
  status: string;
  propertyDetails: PropertyDetails;
  incomeDetails: any;
  assets: any[];
  liabilities: any[];
  documents: any[];
}

class MortgageService {
  async createApplication(data: Partial<MortgageApplication>) {
    // TODO: Implement actual API call
    console.log('Creating application:', data);
    return data;
  }

  async updateApplication(id: string, data: Partial<MortgageApplication>) {
    // TODO: Implement actual API call
    console.log('Updating application:', id, data);
    return data;
  }

  async getUserApplications(): Promise<MortgageApplication[]> {
    // TODO: Implement actual API call
    return [];
  }

  async submitApplication(id: string) {
    // TODO: Implement actual API call
    console.log('Submitting application:', id);
    return true;
  }
}

export const mortgageService = new MortgageService(); 