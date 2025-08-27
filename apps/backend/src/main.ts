import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import { HTTPException } from 'hono/http-exception'
import { serve } from '@hono/node-server'
//import { serviceRoutes } from './routes/services'
import { bookingRoutes } from './routes/bookings'
//import { adminRoutes } from './routes/admin'
//import { productRoutes } from './routes/products'
//import { notificationRoutes } from './routes/notifications'

//import { errorHandler } from './middleware/errorHandler'
import { db } from './db/index'
import auth from './routes/auth'

const app = new Hono()

// Global middleware
app.use('*', cors({
  origin: ['http://localhost:3000', 'https://your-domain.com'],
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'Accept-Language']
}))

app.use('*', logger())
app.use('*', prettyJSON())

// Health check
app.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  })
})

// API Routes
app.route('/api/auth', auth)
//app.route('/api/services', serviceRoutes)
app.route('/api/bookings', bookingRoutes)
//app.route('/api/admin', adminRoutes)
//app.route('/api/products', productRoutes)
//app.route('/api/notifications', notificationRoutes)

// Error handler
//app.onError(errorHandler)

// Start server
const port = parseInt(process.env.PORT || '3001')
serve({
  fetch: app.fetch,
  port
})

console.log(`🚀 Server running on http://localhost:${port}`)

