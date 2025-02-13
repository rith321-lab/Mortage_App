import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
  throw new Error('VITE_SUPABASE_URL is required and must be a valid URL');
}

if (!supabaseAnonKey) {
  throw new Error('VITE_SUPABASE_ANON_KEY is required');
}

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export type UserMetadata = {
  role?: 'buyer' | 'lender' | 'admin';
  firstName?: string;
  lastName?: string;
  phone?: string;
}; 