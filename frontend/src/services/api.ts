import axios, { AxiosInstance, AxiosError } from 'axios';
import { toast } from '@/components/ui/use-toast';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: true, // Important for CORS
  // Add timeout
  timeout: 10000,
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // Log for debugging (remove in production)
      console.log('Sending request with token:', token);
    } else {
      console.warn('No auth token found');
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const message = error.response?.data?.message || 'An unexpected error occurred';
    
    // Handle authentication errors
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }

    // Show error toast
    toast({
      variant: 'destructive',
      title: 'Error',
      description: message,
    });

    if (error.code === 'ERR_NETWORK') {
      console.error('Network error - please check if backend server is running on port 5001');
    }

    return Promise.reject(error);
  }
); 