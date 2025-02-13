import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Error handling interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log errors but don't handle auth errors specially for MVP
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default api; 