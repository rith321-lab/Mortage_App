export interface User {
  id: string;
  email: string;
  name: string;
  role: 'buyer' | 'lender' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  name: string;
  role?: 'buyer' | 'lender' | 'admin';
}

export interface AuthResponse {
  token: string;
  user: User;
} 