// apps/backend/src/routes/bookingRoutes.ts
import { Hono } from 'hono'
import type { Context } from 'hono'
import { BookingController } from '../controllers/bookingController'

const bookingRoutes = new Hono()
const controller = new BookingController()

// Middleware to log all booking requests
bookingRoutes.use('*', async (c: Context, next) => {
  const start = Date.now()
  console.log(`[${new Date().toISOString()}] ${c.req.method} ${c.req.path}`)
  
  await next()
  
  const ms = Date.now() - start
  console.log(`[${new Date().toISOString()}] ${c.req.method} ${c.req.path} - ${c.res.status} (${ms}ms)`)
})

// GET /api/bookings/my - Must come BEFORE /:id to avoid route conflict
bookingRoutes.get('/my', async (c: Context) => {
  try {
    return await controller.getMyBookings(c)
  } catch (error) {
    console.error('Route error in /my:', error)
    return c.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// POST /api/bookings - Create new booking
bookingRoutes.post('/', async (c: Context) => {
  try {
    return await controller.createBooking(c)
  } catch (error) {
    console.error('Route error in POST /:', error)
    return c.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// GET /api/bookings/:id - Get booking by ID or booking number
bookingRoutes.get('/:id', async (c: Context) => {
  try {
    const id = c.req.param('id')
    if (!id) {
      return c.json({ error: 'Booking ID or number is required' }, 400)
    }
    return await controller.getBooking(c)
  } catch (error) {
    console.error('Route error in GET /:id:', error)
    return c.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// PUT /api/bookings/:id/status - Update booking status
bookingRoutes.put('/:id/status', async (c: Context) => {
  try {
    const id = c.req.param('id')
    if (!id) {
      return c.json({ error: 'Booking ID is required' }, 400)
    }
    
    const body = await c.req.json().catch(() => null)
    if (!body || !body.status) {
      return c.json({ error: 'Status is required in request body' }, 400)
    }

    const validStatuses = ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled']
    if (!validStatuses.includes(body.status)) {
      return c.json({ 
        error: 'Invalid status',
        validStatuses 
      }, 400)
    }

    // You'll need to add this method to your BookingController
    // return await controller.updateBookingStatus(c)
    
    return c.json({ 
      message: 'Status update endpoint - implementation needed',
      bookingId: id,
      newStatus: body.status
    }, 501) // Not implemented yet
    
  } catch (error) {
    console.error('Route error in PUT /:id/status:', error)
    return c.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// GET /api/bookings - Get all bookings with pagination
bookingRoutes.get('/', async (c: Context) => {
  try {
    const limit = parseInt(c.req.query('limit') || '20')
    const offset = parseInt(c.req.query('offset') || '0')
    
    if (limit > 100) {
      return c.json({ error: 'Limit cannot exceed 100' }, 400)
    }
    
    return await controller.getMyBookings(c) // This will be updated to handle pagination
    
  } catch (error) {
    console.error('Route error in GET /:', error)
    return c.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

export { bookingRoutes }