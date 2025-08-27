import { cors } from 'hono/cors'

export const corsMiddleware = cors({
  origin: (origin) => {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://your-domain.com',
      'https://www.your-domain.com'
    ]
    
    if (!origin || allowedOrigins.includes(origin)) {
      return origin || '*'
    }
    
    // ❌ return false
    return null // ✅ Correct
  },
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowHeaders: [
    'Content-Type', 
    'Authorization', 
    'Accept-Language',
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  credentials: true,
  maxAge: 3600
})
