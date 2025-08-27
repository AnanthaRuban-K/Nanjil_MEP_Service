// apps/backend/drizzle.config.ts - Fixed for drizzle-kit v0.20.8
import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get database URL from environment
const databaseUrl = process.env['DATABASE_URL'];

if (!databaseUrl) {
  throw new Error(
    'DATABASE_URL environment variable is required. ' +
    'Please add DATABASE_URL=postgresql://postgres:Root%400203@localhost:5433/nanjil_mep_dev'
  );
}

export default {
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  driver: 'pg', // Important: Use 'pg' for PostgreSQL in v0.20.8
  dbCredentials: {
    connectionString: databaseUrl,
  },
  verbose: true,
  strict: true,
} satisfies Config;