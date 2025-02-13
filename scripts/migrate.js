const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Load environment variables
const envPath = path.resolve(__dirname, '../backend/.env');
console.log('Loading environment variables from:', envPath);

if (!fs.existsSync(envPath)) {
  console.error('.env file not found at:', envPath);
  process.exit(1);
}

require('dotenv').config({ path: envPath });

async function runMigrations() {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
      process.exit(1);
    }

    // Initialize axios client
    const client = axios.create({
      baseURL: supabaseUrl,
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      }
    });

    console.log('API client initialized');

    // Read migration files
    const migrationsDir = path.join(__dirname, '../backend/src/db/migrations');
    console.log('Reading migrations from:', migrationsDir);
    
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort((a, b) => {
        const numA = parseInt(a.split('_')[0]);
        const numB = parseInt(b.split('_')[0]);
        return numA - numB;
      });

    console.log(`Found ${files.length} migration files:`, files);

    // Create migrations table
    try {
      await client.post('/rest/v1/rpc/exec_sql', {
        query: `
          CREATE TABLE IF NOT EXISTS _migrations (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL UNIQUE,
            executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
        `
      });
      console.log('Migrations table created or already exists');
    } catch (error) {
      console.error('Error creating migrations table:', error.response?.data || error.message);
      throw error;
    }

    // Execute each migration
    for (const file of files) {
      console.log(`Processing migration: ${file}`);

      try {
        // Check if migration was already executed
        const { data: existingMigrations } = await client.get('/rest/v1/_migrations', {
          params: {
            name: `eq.${file}`,
            select: 'id'
          }
        });

        if (existingMigrations && existingMigrations.length > 0) {
          console.log(`Migration ${file} already executed, skipping...`);
          continue;
        }

        const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
        console.log(`Migration SQL for ${file}:`, sql.substring(0, 100) + '...');

        // Execute migration
        await client.post('/rest/v1/rpc/exec_sql', {
          query: sql
        });

        // Record successful migration
        await client.post('/rest/v1/_migrations', {
          name: file
        });

        console.log(`Migration ${file} completed successfully`);
      } catch (error) {
        console.error(`Error executing migration ${file}:`, error.response?.data || error.message);
        throw error;
      }
    }

    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

runMigrations(); 