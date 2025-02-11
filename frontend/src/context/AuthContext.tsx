import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { supabase } from '../api/auth';
import { signUp, login, logout, getCurrentUser } from '../api/auth'; // Import all auth functions

type AuthContextType = {
  user: any;
  signUp: (email: string, password: string, name: string, role: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean; // Add a loading state
};

const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true); // Initialize loading to true

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false); // Set loading to false when auth state changes
      }
    );

    // Check for initial user session
    const checkInitialUser = async () => {
      try {
        const initialUser = await getCurrentUser();
        setUser(initialUser);
      } catch (error) {
        // Handle errors, e.g., user not logged in
        console.error("Error fetching initial user:", error);
      } finally {
        setLoading(false); // Set loading to false after initial check
      }
    };

    checkInitialUser();

    return () => authListener.subscription.unsubscribe();
  }, []);

  const signUpFn = async (email: string, password: string, name: string, role: string) => {
    try {
      const data = await signUp(email, password, name, role);
      // Supabase session is handled automatically by onAuthStateChange
      // No need to manually set the user here.
    } catch (error:any) {
      throw new Error(error.message); // Re-throw for UI handling
    }
  };

  const loginFn = async (email: string, password: string) => {
    try {
      await login(email, password); // Use the API function
    } catch (error: any) {
      throw new Error(error.message); // Re-throw for UI handling
    }
  };

  const logoutFn = async () => {
    try {
      await logout(); // Use the API function
    } catch (error: any) {
      throw new Error(error.message); // Re-throw for UI handling
    }
  };

  return (
    <AuthContext.Provider value={{ user, signUp: signUpFn, login: loginFn, logout: logoutFn, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 