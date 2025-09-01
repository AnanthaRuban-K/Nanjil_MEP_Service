// apps/backend/src/db/index.ts
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema/bookings'

// Create the connection
const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set')
}

console.log('🔌 Connecting to database...')

// Create postgres connection
const client = postgres(connectionString, {
  ssl: process.env.NODE_ENV === 'production' ? 'require' : false,
  max: 10, // Max connections
  idle_timeout: 20,
  connect_timeout: 10,
})

// Create drizzle instance
export const db = drizzle(client, { 
  schema,
  logger: process.env.NODE_ENV === 'development'
})

console.log('✅ Database connection established')

// Test connection on startup
export async function testConnection() {
  try {
    console.log('🧪 Testing database connection...')
    await client`SELECT 1`
    console.log('✅ Database connection test successful')
    return true
  } catch (error) {
    console.error('❌ Database connection test failed:', error)
    throw error
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('📴 Closing database connection...')
  await client.end()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.log('📴 Closing database connection...')
  await client.end()
  process.exit(0)
})