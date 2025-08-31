// apps/backend/src/db/schema.ts
import { pgTable, serial, varchar, text, timestamp, jsonb, decimal } from 'drizzle-orm/pg-core'

export const bookings = pgTable('bookings', {
  id: serial('id').primaryKey(),
  bookingNumber: varchar('booking_number', { length: 20 }).notNull().unique(),
  serviceType: varchar('service_type', { length: 50 }).notNull(),
  priority: varchar('priority', { length: 20 }).notNull().default('normal'),
  description: text('description').notNull(),
  contactInfo: jsonb('contact_info').notNull(),
  location: jsonb('location'),
  scheduledTime: timestamp('scheduled_time').notNull(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  photos: jsonb('photos').default([]),
  totalCost: decimal('total_cost', { precision: 10, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
})

export type Booking = typeof bookings.$inferSelect
export type NewBooking = typeof bookings.$inferInsert