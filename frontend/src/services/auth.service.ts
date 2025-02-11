import { api } from './api';
import { User } from '@supabase/supabase-js';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData extends LoginCredentials {
  name: string;
  role: 'buyer' | 'lender' | 'admin';
}

export interface AuthResponse {
  token: string;
  user: User;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/login', credentials);
    return data;
  }

  async signup(signupData: SignupData): Promise<AuthResponse> {
    try {
      const { data } = await api.post<AuthResponse>('/auth/signup', signupData);
      return data;
    } catch (error) {
      console.error('Signup error details:', error);
      throw error;
    }
  }

  async resetPasswordRequest(email: string): Promise<void> {
    await api.post('/auth/reset-password-request', { email });
  }

  async updatePassword(newPassword: string): Promise<void> {
    await api.post('/auth/update-password', { newPassword });
  }

  async getCurrentUser(): Promise<User> {
    const { data } = await api.get<{ user: User }>('/auth/me');
    return data.user;
  }

  async logout(): Promise<void> {
    await api.post('/auth/logout');
    localStorage.removeItem('auth_token');
  }
}

export const authService = new AuthService(); 