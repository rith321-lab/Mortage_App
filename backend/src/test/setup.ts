import { supabase } from '../config/supabase';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

beforeAll(async () => {
  // Setup test database if needed
});

afterAll(async () => {
  // Cleanup after tests
  await supabase.end();
});

beforeEach(async () => {
  // Clear test data before each test
  const tables = ['documents', 'mortgage_applications', 'users'];
  for (const table of tables) {
    await supabase.from(table).delete().neq('id', '0');
  }
}); 