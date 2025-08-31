// apps/backend/src/db/index.ts
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema/bookings'

const connectionString = process.env.DATABASE_URL!
const sql = postgres(connectionString, { max: 1 })
export const db = drizzle(sql, { schema })