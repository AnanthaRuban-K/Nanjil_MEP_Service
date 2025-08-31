// apps/backend/src/services/bookingService.ts
import { db } from '../db'
import { bookings, type NewBooking } from '../db/schema/bookings'
import { eq, desc } from 'drizzle-orm'

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
        photos: data.photos,
        totalCost: totalCost.toString(),
        status: 'pending'
      }
      
      const [booking] = await db.insert(bookings).values(newBooking).returning()
      return booking
      
    } catch (error) {
      console.error('Database error in createBooking:', error)
      throw new Error(`Failed to create booking: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async getBookingById(id: number) {
    try {
      const result = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1)
      return result[0] || null
    } catch (error) {
      console.error('Database error in getBookingById:', error)
      throw new Error(`Failed to get booking: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async getBookingByNumber(bookingNumber: string) {
    try {
      const result = await db
        .select()
        .from(bookings)
        .where(eq(bookings.bookingNumber, bookingNumber))
        .limit(1)
      
      return result[0] || null
    } catch (error) {
      console.error('Database error in getBookingByNumber:', error)
      throw new Error(`Failed to get booking: ${error instanceof Error ? error.message : 'Unknown error'}`)
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
      console.error('Database error in getAllBookings:', error)
      throw new Error(`Failed to get bookings: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async updateBookingPhotos(id: number, photoUrls: string[]) {
    try {
      await db
        .update(bookings)
        .set({ 
          photos: photoUrls, 
          updatedAt: new Date() 
        })
        .where(eq(bookings.id, id))
    } catch (error) {
      console.error('Database error in updateBookingPhotos:', error)
      throw new Error(`Failed to update photos: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async updateBookingStatus(id: number, status: string) {
    try {
      await db
        .update(bookings)
        .set({ 
          status, 
          updatedAt: new Date() 
        })
        .where(eq(bookings.id, id))
    } catch (error) {
      console.error('Database error in updateBookingStatus:', error)
      throw new Error(`Failed to update status: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private generateBookingNumber(): string {
    const timestamp = Date.now().toString()
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    return `NMS${timestamp.slice(-6)}${random.slice(-2)}`
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