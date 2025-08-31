// apps/backend/src/controllers/bookingController.ts
import { Context } from 'hono'
import { BookingService } from '../services/bookingService'

export class BookingController {
  private bookingService = new BookingService()

  async createBooking(c: Context) {
    try {
      // Check content type
      const contentType = c.req.header('content-type') || ''
      console.log('Content-Type:', contentType)
      
      if (!contentType.includes('multipart/form-data')) {
        return c.json({
          error: 'Expected multipart/form-data',
          received: contentType
        }, 400)
      }

      // Parse multipart form data
      let body
      try {
        body = await c.req.parseBody({ all: true })
        console.log('Parsed body keys:', Object.keys(body))
        console.log('Full body:', body)
      } catch (parseError) {
  console.error('Body parsing failed:', parseError)
  return c.json({
    error: 'Failed to parse multipart data',
    details: parseError instanceof Error ? parseError.message : String(parseError)
  }, 400)
}

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
      } catch (error) {
        console.error('contactInfo parsing error:', contactInfoStr)
        return c.json({
          error: 'Invalid contactInfo JSON',
          received: contactInfoStr
        }, 400)
      }

      let location = null
      if (locationStr && locationStr !== 'undefined') {
        try {
          location = JSON.parse(locationStr as string)
        } catch (error) {
          console.error('location parsing error:', locationStr)
        }
      }

      // Create booking
      const bookingData = {
        serviceType: serviceType as 'electrical' | 'plumbing',
        priority: priority as 'normal' | 'urgent' | 'emergency',
        description: description as string,
        contactInfo,
        location,
        scheduledTime: new Date(scheduledTime as string),
        photos: []
      }

      const booking = await this.bookingService.createBooking(bookingData)

      return c.json({
        success: true,
        booking
      }, 201)

    } catch (error) {
      console.error('Create booking error:', error)
      return c.json({
        error: 'Booking creation failed',
        message: error instanceof Error ? error.message : 'Unknown error'
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
      return c.json({ error: 'Failed to fetch booking' }, 500)
    }
  }


  async getMyBookings(c: Context) {
    try {
      const bookings = await this.bookingService.getAllBookings()
      return c.json({ bookings })
      
    } catch (error) {
      return c.json({ error: 'Failed to fetch bookings' }, 500)
    }
  }
}