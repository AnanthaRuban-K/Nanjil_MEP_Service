// apps/backend/src/controllers/bookingController.ts
import { Context } from 'hono'
import { BookingService } from '../services/bookingService'

export class BookingController {
  private bookingService = new BookingService()

  async createBooking(c: Context) {
    try {
      console.log('=== Booking Creation Started ===')
      
      const contentType = c.req.header('content-type') || ''
      console.log('Content-Type:', contentType)
      
      if (!contentType.includes('multipart/form-data')) {
        return c.json({
          error: 'Expected multipart/form-data',
          received: contentType
        }, 400)
      }

      const body = await c.req.parseBody({ all: true })
      console.log('Parsed body keys:', Object.keys(body))
      console.log('Full body:', body)

      // Extract and validate fields
      const serviceType = body.serviceType
      const priority = body.priority || 'normal'
      const description = body.description
      const scheduledTime = body.scheduledTime
      const contactInfoStr = body.contactInfo
      const locationStr = body.location

      console.log('Extracted fields:', {
        serviceType,
        priority,
        description: description ? 'present' : 'missing',
        scheduledTime,
        contactInfoStr: contactInfoStr ? 'present' : 'missing',
        locationStr: locationStr ? 'present' : 'missing'
      })

      // Validate required fields
      if (!serviceType || !description || !scheduledTime || !contactInfoStr) {
        return c.json({
          error: 'Missing required fields',
          missing: {
            serviceType: !serviceType,
            description: !description,
            scheduledTime: !scheduledTime,
            contactInfo: !contactInfoStr
          }
        }, 400)
      }

      // Parse JSON fields
      let contactInfo
      try {
        contactInfo = JSON.parse(contactInfoStr as string)
        console.log('Parsed contactInfo:', contactInfo)
      } catch (error) {
        console.error('contactInfo parsing error:', error)
        return c.json({
          error: 'Invalid contactInfo JSON',
          received: contactInfoStr,
          details: error instanceof Error ? error.message : 'Unknown parsing error'
        }, 400)
      }

      let location = null
      if (locationStr && locationStr !== 'undefined') {
        try {
          location = JSON.parse(locationStr as string)
          console.log('Parsed location:', location)
        } catch (error) {
          console.error('location parsing error:', locationStr, error)
        }
      }

      // Validate scheduledTime
      const scheduledDate = new Date(scheduledTime as string)
      if (isNaN(scheduledDate.getTime())) {
        return c.json({
          error: 'Invalid scheduledTime format',
          received: scheduledTime
        }, 400)
      }

      // Create booking data
      const bookingData = {
        serviceType: serviceType as 'electrical' | 'plumbing',
        priority: priority as 'normal' | 'urgent' | 'emergency',
        description: description as string,
        contactInfo,
        location,
        scheduledTime: scheduledDate,
        photos: []
      }

      console.log('Final booking data:', bookingData)

      // Create booking
      const booking = await this.bookingService.createBooking(bookingData)
      console.log('Booking created successfully:', booking)

      return c.json({
        success: true,
        booking
      }, 201)

    } catch (error) {
      console.error('=== Create booking error ===')
      console.error('Error type:', typeof error)
      console.error('Error instance:', error instanceof Error)
      console.error('Error message:', error instanceof Error ? error.message : 'No message')
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack')
      console.error('Full error object:', error)
      
      return c.json({
        error: 'Booking creation failed',
        message: error instanceof Error ? error.message : String(error),
        details: process.env.NODE_ENV === 'development' ? {
          stack: error instanceof Error ? error.stack : undefined,
          type: typeof error
        } : undefined
      }, 500)
    }
  }

  async getBooking(c: Context) {
    try {
      const param = c.req.param('id')
      let booking
      
      // Check if param is a booking number (starts with letters) or numeric ID
      if (isNaN(Number(param))) {
        // It's a booking number like NMS78781691
        booking = await this.bookingService.getBookingByNumber(param)
      } else {
        // It's a numeric ID
        booking = await this.bookingService.getBookingById(Number(param))
      }
      
      if (!booking) {
        return c.json({ error: 'Booking not found' }, 404)
      }
      
      return c.json({ booking })
      
    } catch (error) {
      console.error('Get booking error:', error)
      return c.json({ 
        error: 'Failed to fetch booking',
        message: error instanceof Error ? error.message : String(error)
      }, 500)
    }
  }

  async getMyBookings(c: Context) {
    try {
      // In production, you'd get user ID from authentication context
      const bookings = await this.bookingService.getAllBookings()
      return c.json({ bookings })
      
    } catch (error) {
      console.error('Get my bookings error:', error)
      return c.json({ 
        error: 'Failed to fetch bookings',
        message: error instanceof Error ? error.message : String(error)
      }, 500)
    }
  }

  // Add endpoints for MyBookings component
  async rateBooking(c: Context) {
    try {
      const bookingId = c.req.param('id')
      const { rating, review } = await c.req.json()

      if (!rating || rating < 1 || rating > 5) {
        return c.json({ error: 'Invalid rating (1-5 required)' }, 400)
      }

      await this.bookingService.rateBooking(bookingId, rating, review || '')
      
      return c.json({ success: true, message: 'Rating saved successfully' })
    } catch (error) {
      console.error('Rate booking error:', error)
      return c.json({ 
        error: 'Failed to rate booking',
        message: error instanceof Error ? error.message : String(error)
      }, 500)
    }
  }

  async cancelBooking(c: Context) {
    try {
      const bookingId = c.req.param('id')
      const { reason } = await c.req.json()

      await this.bookingService.cancelBooking(bookingId, reason || 'Cancelled by customer')
      
      return c.json({ success: true, message: 'Booking cancelled successfully' })
    } catch (error) {
      console.error('Cancel booking error:', error)
      return c.json({ 
        error: 'Failed to cancel booking',
        message: error instanceof Error ? error.message : String(error)
      }, 500)
    }
  }
}