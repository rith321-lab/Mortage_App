import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api'
});

export interface Application {
  id: number;
  name: string;
  email: string;
  status: string;
  amount: number;
  propertyAddress: string;
  propertyType: string;
  creditScore: number;
  income: number;
  employmentStatus: string;
  submittedAt: string;
}

export const getApplications = () => api.get<Application[]>('/applications');
export const getApplicationById = (id: number) => api.get<Application>(`/applications/${id}`);
export const createApplication = (application: Omit<Application, 'id' | 'status' | 'submittedAt'>) => 
  api.post<Application>('/applications', application);
