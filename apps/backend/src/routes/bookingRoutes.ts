import { Hono } from 'hono'
import { BookingController } from '../controllers/bookingController'

const bookingRoutes = new Hono()
const controller = new BookingController()

// POST /api/bookings
bookingRoutes.post('/', (c) => controller.createBooking(c))

// GET /api/bookings/:id
bookingRoutes.get('/:id', (c) => controller.getBooking(c))

// GET /api/bookings/my
bookingRoutes.get('/my', (c) => controller.getMyBookings(c))

export { bookingRoutes }