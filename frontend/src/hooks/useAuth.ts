import { useState, useEffect } from 'react';
import { supabaseClient } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'buyer' | 'lender' | 'admin';
}

interface UseAuth {
  user: AuthUser | null;
  loading: boolean;
  error: Error | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, firstName: string, lastName: string, role?: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<AuthUser>) => Promise<void>;
}

export function useAuth(): UseAuth {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Check active sessions
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        updateUserData(session.user);
      }
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await updateUserData(session.user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function updateUserData(supabaseUser: User) {
    const { firstName, lastName, role } = supabaseUser.user_metadata;
    setUser({
      id: supabaseUser.id,
      email: supabaseUser.email!,
      firstName,
      lastName,
      role: role || 'buyer'
    });
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      if (data.user) {
        await updateUserData(data.user);
      }
    } catch (error) {
      setError(error as Error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string, role: string = 'buyer') => {
    try {
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: {
            firstName,
            lastName,
            role
          }
        }
      });
      if (error) throw error;
      if (data.user) {
        await updateUserData(data.user);
      }
    } catch (error) {
      setError(error as Error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabaseClient.auth.signOut();
      if (error) throw error;
      setUser(null);
    } catch (error) {
      setError(error as Error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
    } catch (error) {
      setError(error as Error);
      throw error;
    }
  };

  const updateProfile = async (data: Partial<AuthUser>) => {
    try {
      const { error } = await supabaseClient.auth.updateUser({
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          role: data.role
        }
      });
      if (error) throw error;
      if (user) {
        setUser({ ...user, ...data });
      }
    } catch (error) {
      setError(error as Error);
      throw error;
    }
  };

  return {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile
  };
} 