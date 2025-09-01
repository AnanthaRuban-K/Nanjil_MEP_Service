// apps/backend/src/scripts/migrate.ts
import { db } from '../db'
import { bookings } from '../db/schema/bookings'
import { sql } from 'drizzle-orm'

async function migrate() {
  try {
    console.log('Creating bookings table...')
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        booking_number VARCHAR(20) UNIQUE NOT NULL,
        service_type VARCHAR(50) NOT NULL,
        priority VARCHAR(20) NOT NULL DEFAULT 'normal',
        description TEXT NOT NULL,
        contact_info JSONB NOT NULL,
        location JSONB,
        scheduled_time TIMESTAMP NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        photos JSONB DEFAULT '[]'::jsonb,
        total_cost DECIMAL(10,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `)
    
    // Create indexes
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status)`)
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at)`)
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_bookings_booking_number ON bookings(booking_number)`)
    
    console.log('Tables created successfully!')
    
    // Test insert
    const testBooking = {
      bookingNumber: 'TEST001',
      serviceType: 'electrical',
      priority: 'normal',
      description: 'Test booking',
      contactInfo: { name: 'Test User', phone: '1234567890', address: 'Test Address' },
      scheduledTime: new Date(),
      status: 'pending',
      totalCost: '350.00'
    }
    
    const [result] = await db.insert(bookings).values(testBooking).returning()
    console.log('Test booking created:', result)
    
    // Clean up test booking
    await db.delete(bookings).where(sql`booking_number = 'TEST001'`)
    console.log('Test booking cleaned up')
    
  } catch (error) {
    console.error('Migration failed:', error)
  } finally {
    process.exit(0)
  }
}

migrate()