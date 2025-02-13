import { api } from '../lib/api';
import { Property } from '../types/mortgage';

export const propertyService = {
  // Create new property
  create: async (propertyData: Partial<Property>) => {
    const response = await api.post('/properties', propertyData);
    return response.data;
  },

  // Get all properties
  getAll: async () => {
    const response = await api.get('/properties');
    return response.data;
  },

  // Get property by ID
  getById: async (id: string) => {
    const response = await api.get(`/properties/${id}`);
    return response.data;
  },

  // Update property
  update: async (id: string, propertyData: Partial<Property>) => {
    const response = await api.put(`/properties/${id}`, propertyData);
    return response.data;
  },

  // Delete property
  delete: async (id: string) => {
    await api.delete(`/properties/${id}`);
  },

  // Helper method to validate property data
  validatePropertyData(property: Partial<Property>): string[] {
    const errors: string[] = [];

    if (!property.address) errors.push('Address is required');
    if (!property.city) errors.push('City is required');
    if (!property.state) errors.push('State is required');
    if (!property.zipCode) errors.push('ZIP code is required');
    if (!property.propertyType) errors.push('Property type is required');
    if (!property.purchasePrice || property.purchasePrice <= 0) {
      errors.push('Valid purchase price is required');
    }
    if (!property.estimatedValue || property.estimatedValue <= 0) {
      errors.push('Valid estimated value is required');
    }
    if (!property.yearBuilt || property.yearBuilt <= 1800) {
      errors.push('Valid year built is required');
    }

    return errors;
  },

  // Helper method to format currency values
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  },

  // Helper method to calculate property metrics
  calculatePropertyMetrics(property: Property) {
    return {
      loanToValue: property.purchasePrice / property.estimatedValue,
      pricePerSqFt: property.squareFeet 
        ? property.purchasePrice / property.squareFeet 
        : null,
      monthlyExpenses: (property.propertyTax || 0) / 12 +
        (property.insuranceCost || 0) / 12 +
        (property.hoaFees || 0)
    };
  }
}; 