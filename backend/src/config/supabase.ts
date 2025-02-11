import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mpmhmudbfhtcnwygxsog.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wbWhtdWRiZmh0Y253eWd4c29nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkyMzY0NzUsImV4cCI6MjA1NDgxMjQ3NX0.3B5iI2JLzn7b6G4WSYh0kq80yH4bUr7rxFnmFl4CWR8';

export const supabase = createClient(
  supabaseUrl,
  supabaseKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  }
); 