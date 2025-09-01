// apps/backend/src/controllers/bookingController.ts
import type { Context } from 'hono'
import { BookingService } from '../services/bookingService'
import { z } from 'zod'

// Validation schemas
const contactInfoSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number'),
  address: z.string().min(10, 'Address must be at least 10 characters')
})

const locationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180)
}).optional()

const createBookingSchema = z.object({
  serviceType: z.enum(['electrical', 'plumbing']),
  priority: z.enum(['normal', 'urgent', 'emergency']).default('normal'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  scheduledTime: z.string().datetime(),
  contactInfo: contactInfoSchema,
  location: locationSchema,
  photos: z.array(z.string().url()).default([])
})

export class BookingController {
  private bookingService = new BookingService()

  async createBooking(c: Context) {
    try {
      console.log('📝 Creating new booking...')
      
      // Check content type
      const contentType = c.req.header('content-type') || ''
      console.log('Content-Type:', contentType)
      
      let bodyData: any = {}

      if (contentType.includes('multipart/form-data')) {
        // Handle multipart form data (with file uploads)
        try {
          const body = await c.req.parseBody({ all: true })
          console.log('Parsed multipart body keys:', Object.keys(body))

          // Extract fields from multipart data
          bodyData = {
            serviceType: body.serviceType,
            priority: body.priority || 'normal',
            description: body.description,
            scheduledTime: body.scheduledTime,
            contactInfo: body.contactInfo ? JSON.parse(body.contactInfo as string) : null,
            location: body.location && body.location !== 'undefined' 
              ? JSON.parse(body.location as string) 
              : null,
            photos: []
          }
        } catch (parseError) {
          console.error('Multipart parsing failed:', parseError)
          return c.json({
            error: 'Failed to parse multipart data',
            details: parseError instanceof Error ? parseError.message : String(parseError)
          }, 400)
        }
      } else if (contentType.includes('application/json')) {
        // Handle JSON data
        try {
          bodyData = await c.req.json()
          console.log('Parsed JSON body:', Object.keys(bodyData))
        } catch (parseError) {
          console.error('JSON parsing failed:', parseError)
          return c.json({
            error: 'Invalid JSON data',
            details: parseError instanceof Error ? parseError.message : String(parseError)
          }, 400)
        }
      } else {
        return c.json({
          error: 'Unsupported content type',
          expected: ['application/json', 'multipart/form-data'],
          received: contentType
        }, 400)
      }

      // Validate the parsed data
      console.log('Validating booking data:', {
        serviceType: bodyData.serviceType,
        priority: bodyData.priority,
        hasDescription: !!bodyData.description,
        hasContactInfo: !!bodyData.contactInfo,
        hasLocation: !!bodyData.location,
        scheduledTime: bodyData.scheduledTime
      })

      const validationResult = createBookingSchema.safeParse(bodyData)
      
      if (!validationResult.success) {
        console.error('Validation failed:', validationResult.error.errors)
        return c.json({
          error: 'Validation failed',
          details: validationResult.error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            received: err.code === 'invalid_type' ? typeof (err as any).received : undefined
          }))
        }, 400)
      }

      const validatedData = validationResult.data

      // Create booking with validated data
      const bookingData = {
        serviceType: validatedData.serviceType,
        priority: validatedData.priority,
        description: validatedData.description,
        contactInfo: validatedData.contactInfo,
        location: validatedData.location || null,
        scheduledTime: new Date(validatedData.scheduledTime),
        photos: validatedData.photos
      }

      console.log('Creating booking with validated data')
      const booking = await this.bookingService.createBooking(bookingData)
      
      console.log('✅ Booking created successfully:', booking.bookingNumber)

      return c.json({
        success: true,
        booking,
        message: 'Booking created successfully'
      }, 201)

    } catch (error) {
      console.error('❌ Create booking error:', error)
      
      // Handle specific database errors
      if (error instanceof Error) {
        if (error.message.includes('connection')) {
          return c.json({
            error: 'Database connection failed',
            message: 'Please try again later'
          }, 503)
        }
        
        if (error.message.includes('constraint')) {
          return c.json({
            error: 'Data constraint violation',
            message: 'Invalid data provided'
          }, 400)
        }
      }

      return c.json({
        error: 'Booking creation failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }, 500)
    }
  }

  async getBooking(c: Context) {
    try {
      const param = c.req.param('id')
      console.log(`🔍 Getting booking: ${param}`)
      
      if (!param) {
        return c.json({ error: 'Booking ID or number is required' }, 400)
      }

      let booking
      
      // Check if param is a booking number (starts with letters) or numeric ID
      if (isNaN(Number(param))) {
        // It's a booking number like NMS78781691
        booking = await this.bookingService.getBookingByNumber(param)
      } else {
        // It's a numeric ID
        const numericId = parseInt(param)
        if (numericId <= 0) {
          return c.json({ error: 'Invalid booking ID' }, 400)
        }
        booking = await this.bookingService.getBookingById(numericId)
      }
      
      if (!booking) {
        console.log(`❌ Booking not found: ${param}`)
        return c.json({ 
          error: 'Booking not found',
          searchedFor: param 
        }, 404)
      }
      
      console.log(`✅ Booking found: ${booking.bookingNumber}`)
      return c.json({ 
        success: true,
        booking 
      })
      
    } catch (error) {
      console.error('❌ Get booking error:', error)
      return c.json({ 
        error: 'Failed to fetch booking',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, 500)
    }
  }

  async getMyBookings(c: Context) {
    try {
      console.log('📋 Getting all bookings...')
      
      // Get pagination parameters
      const limit = parseInt(c.req.query('limit') || '20')
      const offset = parseInt(c.req.query('offset') || '0')
      const status = c.req.query('status')
      
      console.log(`Pagination: limit=${limit}, offset=${offset}, status=${status || 'all'}`)
      
      if (limit > 100) {
        return c.json({ error: 'Limit cannot exceed 100' }, 400)
      }
      
      if (limit < 1 || offset < 0) {
        return c.json({ error: 'Invalid pagination parameters' }, 400)
      }

      const bookings = await this.bookingService.getAllBookings(limit, offset)
      
      console.log(`✅ Found ${bookings.length} bookings`)

      return c.json({ 
        success: true,
        bookings,
        pagination: {
          limit,
          offset,
          count: bookings.length
        }
      })
      
    } catch (error) {
      console.error('❌ Get bookings error:', error)
      return c.json({ 
        error: 'Failed to fetch bookings',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, 500)
    }
  }

  async updateBookingStatus(c: Context) {
    try {
      const id = c.req.param('id')
      const body = await c.req.json()
      
      if (!id || isNaN(Number(id))) {
        return c.json({ error: 'Valid booking ID is required' }, 400)
      }

      if (!body.status) {
        return c.json({ error: 'Status is required' }, 400)
      }

      const validStatuses = ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled']
      if (!validStatuses.includes(body.status)) {
        return c.json({ 
          error: 'Invalid status',
          validStatuses 
        }, 400)
      }

      await this.bookingService.updateBookingStatus(parseInt(id), body.status)
      
      return c.json({
        success: true,
        message: 'Booking status updated successfully',
        bookingId: id,
        newStatus: body.status
      })
      
    } catch (error) {
      console.error('❌ Update booking status error:', error)
      return c.json({
        error: 'Failed to update booking status',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, 500)
    }
  }
}