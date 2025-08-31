import { db } from '../db/index'
import { bookings } from '../db/schema/bookings'
import { desc, like } from 'drizzle-orm'

export async function generateBookingNumber(): Promise<string> {
  try {
    // Get the latest booking number
    const latestBooking = await db
      .select()
      .from(bookings)
      .where(like(bookings.bookingNumber, 'NMS%'))
      .orderBy(desc(bookings.createdAt))
      .limit(1)

    let nextNumber = 1
    if (latestBooking.length > 0) {
      const currentNumber = parseInt(latestBooking[0].bookingNumber.replace('NMS', ''))
      nextNumber = currentNumber + 1
    }

    return `NMS${nextNumber.toString().padStart(3, '0')}`
  } catch (error) {
    console.error('Error generating booking number:', error)
    // Fallback to timestamp-based number
    return `NMS${Date.now().toString().slice(-6)}`
  }
}