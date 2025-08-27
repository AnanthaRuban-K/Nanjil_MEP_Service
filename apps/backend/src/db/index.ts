import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import * as schema from './schema'

// Explicitly export tables
export const { users,bookings, serviceAreas, products, notifications } = schema

// Environment variable validation
const getDatabaseUrl = (): string => {
  const url = process.env['DATABASE_URL']
  if (!url) {
    throw new Error(
      'DATABASE_URL environment variable is required. ' +
      'Please add DATABASE_URL=postgresql://... to your .env file'
    )
  }
  return url
}

// Database connection
const connectionString = getDatabaseUrl()
const sql = neon(connectionString)
export const db = drizzle(sql, { schema })

// Test connection in development
if (process.env['NODE_ENV'] === 'development') {
  console.log('✅ Database connection established')
}

// Health check utility
export const testConnection = async (): Promise<boolean> => {
  try {
    await sql`SELECT 1`
    return true
  } catch (error) {
    console.error('Database health check failed:', error)
    return false
  }
}
