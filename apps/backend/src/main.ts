// apps/backend/src/main.ts
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { bookingRoutes } from './routes/bookingRoutes'

const app = new Hono()

// Production middleware
app.use('*', logger())
app.use(
  '*',
  cors({
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://nanjilmepservice.com']
      : ['http://localhost:3100', 'http://localhost:3101'],
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  })
)

// Health check (public)
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  })
})

// Protected routes

app.route('/api/bookings', bookingRoutes)

// Root endpoint
app.get('/', (c) => {
  return c.json({ 
    message: 'Nanjil MEP Service API',
    version: '1.0.0',
    status: 'running'
  })
})

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not found' }, 404)
})

// Error handler
app.onError((err, c) => {
  console.error('Server error:', err)
  return c.json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  }, 500)
})

const port = parseInt(process.env.PORT || '3101')

serve({
  fetch: app.fetch,
  port,
}, (info) => {
  console.log(`Backend running at http://localhost:${info.port}`)
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
})