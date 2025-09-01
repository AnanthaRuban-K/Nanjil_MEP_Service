// apps/backend/src/services/bookingService.ts
import { db } from '../db'
import { bookings, type NewBooking } from '../db/schema/bookings'
import { eq, desc, sql } from 'drizzle-orm'

export class BookingService {
  async createBooking(data: {
    serviceType: 'electrical' | 'plumbing'
    priority: 'normal' | 'urgent' | 'emergency'
    description: string
    contactInfo: any
    location?: any
    scheduledTime: Date
    photos: string[]
  }) {
    try {
      console.log('Creating booking with data:', data)
      
      const bookingNumber = this.generateBookingNumber()
      const totalCost = this.calculateCost(data.serviceType, data.priority)
      
      const newBooking: NewBooking = {
        bookingNumber,
        serviceType: data.serviceType,
        priority: data.priority,
        description: data.description,
        contactInfo: data.contactInfo,
        location: data.location || null,
        scheduledTime: data.scheduledTime,
        photos: data.photos.length > 0 ? data.photos : [],
        totalCost: totalCost.toString(),
        status: 'pending'
      }
      
      console.log('Inserting booking:', newBooking)
      
      const [booking] = await db.insert(bookings).values(newBooking).returning()
      
      console.log('Booking created successfully:', booking.bookingNumber)
      return booking
      
    } catch (error) {
      console.error('BookingService.createBooking error:', error)
      throw new Error(`Failed to create booking: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  async getBookingById(id: number) {
    try {
      const [booking] = await db.select().from(bookings).where(eq(bookings.id, id))
      return booking || null
    } catch (error) {
      console.error('getBookingById error:', error)
      throw new Error(`Failed to get booking: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  async getBookingByNumber(bookingNumber: string) {
    try {
      const [booking] = await db.select().from(bookings).where(eq(bookings.bookingNumber, bookingNumber))
      return booking || null
    } catch (error) {
      console.error('getBookingByNumber error:', error)
      throw new Error(`Failed to get booking: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  async getAllBookings(limit = 50, offset = 0) {
    try {
      return await db
        .select()
        .from(bookings)
        .orderBy(desc(bookings.createdAt))
        .limit(limit)
        .offset(offset)
    } catch (error) {
      console.error('getAllBookings error:', error)
      throw new Error(`Failed to get bookings: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  async updateBookingStatus(bookingId: string, status: string) {
    try {
      const isNumeric = !isNaN(Number(bookingId))
      
      if (isNumeric) {
        await db
          .update(bookings)
          .set({ status, updatedAt: new Date() })
          .where(eq(bookings.id, Number(bookingId)))
      } else {
        await db
          .update(bookings)
          .set({ status, updatedAt: new Date() })
          .where(eq(bookings.bookingNumber, bookingId))
      }
    } catch (error) {
      console.error('updateBookingStatus error:', error)
      throw new Error(`Failed to update booking status: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  async rateBooking(bookingId: string, rating: number, review: string) {
    // For now, just log the rating since we don't have rating columns in schema
    console.log(`Rating received for booking ${bookingId}: ${rating}/5 stars - ${review}`)
    return Promise.resolve()
  }

  async cancelBooking(bookingId: string, reason: string) {
    try {
      await this.updateBookingStatus(bookingId, 'cancelled')
      console.log(`Booking ${bookingId} cancelled. Reason: ${reason}`)
    } catch (error) {
      throw new Error(`Failed to cancel booking: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  private generateBookingNumber(): string {
    const timestamp = Date.now().toString()
    const random = Math.floor(Math.random() * 999).toString().padStart(3, '0')
    return `NMS${timestamp.slice(-6)}${random}`
  }

  private calculateCost(serviceType: string, priority: string): number {
    const serviceFees = {
      electrical: 300,
      plumbing: 350
    }
    
    const baseCost = serviceFees[serviceType as keyof typeof serviceFees] || 300
    const emergencyMultiplier = priority === 'emergency' ? 1.5 : priority === 'urgent' ? 1.2 : 1
    const travelCharge = 50
    
    return Math.round((baseCost * emergencyMultiplier) + travelCharge)
  }
}