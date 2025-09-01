// apps/backend/src/main.ts
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { bookingRoutes } from './routes/bookingRoutes'
import type { Context } from 'hono'

const app = new Hono()

// Middleware
app.use('*', logger())
app.use(
  '*',
  cors({
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://nanjilmepservice.com', 'https://nanjil-mep-services.vercel.app']
      : ['http://localhost:3100', 'http://localhost:3000', 'http://127.0.0.1:3100'],
    allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    credentials: true,
  })
)

// Health check endpoint
app.get('/health', (c: Context) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    uptime: process.uptime()
  })
})

// API Routes
app.route('/api/bookings', bookingRoutes)

// Root endpoint
app.get('/', (c: Context) => {
  return c.json({ 
    message: 'Nanjil MEP Service API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      bookings: '/api/bookings',
      docs: 'https://github.com/your-repo/docs'
    }
  })
})

// Catch all API routes
app.get('/api/*', (c: Context) => {
  return c.json({ 
    error: 'API endpoint not found',
    available: ['/api/bookings']
  }, 404)
})

// 404 handler for all routes
app.notFound((c: Context) => {
  return c.json({ 
    error: 'Route not found',
    path: c.req.path,
    method: c.req.method
  }, 404)
})

// Global error handler
app.onError((err: Error, c: Context) => {
  console.error(`[ERROR] ${new Date().toISOString()}:`, {
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: c.req.path,
    method: c.req.method,
    userAgent: c.req.header('user-agent')
  })

  return c.json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    timestamp: new Date().toISOString()
  }, 500)
})

const port = parseInt(process.env.PORT || '3101')
const hostname = process.env.HOSTNAME || 'localhost'

console.log(`🚀 Starting Nanjil MEP Service API...`)
console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`)
console.log(`🌐 Port: ${port}`)

serve({
  fetch: app.fetch,
  port,
  hostname: process.env.NODE_ENV === 'production' ? '0.0.0.0' : hostname,
}, (info) => {
  console.log(`✅ Backend running at http://${info.address}:${info.port}`)
  console.log(`🔍 Health check: http://${info.address}:${info.port}/health`)
  console.log(`📋 API docs: http://${info.address}:${info.port}/`)
  
  // Log important environment variables (without sensitive values)
  console.log(`🔧 Environment variables loaded:`)
  console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'not set'}`)
  console.log(`   DATABASE_URL: ${process.env.DATABASE_URL ? '✅ configured' : '❌ missing'}`)
  console.log(`   REDIS_URL: ${process.env.REDIS_URL ? '✅ configured' : '❌ missing'}`)
})