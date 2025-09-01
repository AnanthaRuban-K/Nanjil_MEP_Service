// apps/backend/src/db/index.ts
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema/bookings'

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:Root%400203@localhost:5433/nanjil_mep_dev'

console.log('Connecting to database on port 5433...')

const sql = postgres(connectionString, { 
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
})

export const db = drizzle(sql, { schema })

// Test connection on startup
sql`SELECT 1`.then(() => {
  console.log('Database connected successfully on port 5433')
}).catch((error) => {
  console.error('Database connection failed:', error.message)
  console.error('Make sure PostgreSQL is running on port 5433')
})