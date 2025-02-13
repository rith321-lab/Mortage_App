import React, { createContext, useContext } from 'react';

// Simplified user type for MVP
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'buyer' | 'lender' | 'admin';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  logout: () => void;
}

// Mock user for MVP
const mockUser: User = {
  id: '1',
  email: 'demo@example.com',
  firstName: 'Demo',
  lastName: 'User',
  role: 'buyer'
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  logout: () => {}
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // For MVP, we'll always return the mock user
  const value = {
    user: mockUser,
    isAuthenticated: true,
    logout: () => {
      console.log('Logout clicked - no implementation needed for MVP');
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 