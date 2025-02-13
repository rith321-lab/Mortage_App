import { api } from '../lib/api';
import { MortgageApplication } from '../types/mortgage';

export const mortgageApplicationService = {
  // Create new mortgage application
  create: async (applicationData: Partial<MortgageApplication>) => {
    const response = await api.post('/mortgage-applications', applicationData);
    return response.data;
  },

  // Get all applications
  getAll: async () => {
    const response = await api.get('/mortgage-applications');
    return response.data;
  },

  // Get application by ID
  getById: async (id: string) => {
    const response = await api.get(`/mortgage-applications/${id}`);
    return response.data;
  },

  // Update application
  update: async (id: string, applicationData: Partial<MortgageApplication>) => {
    const response = await api.put(`/mortgage-applications/${id}`, applicationData);
    return response.data;
  },

  // Delete application
  delete: async (id: string) => {
    await api.delete(`/mortgage-applications/${id}`);
  },

  // Submit application (changes status to SUBMITTED)
  submit: async (id: string) => {
    const response = await api.put(`/mortgage-applications/${id}/submit`, {
      status: 'submitted',
      submittedAt: new Date()
    });
    return response.data;
  }
}; 