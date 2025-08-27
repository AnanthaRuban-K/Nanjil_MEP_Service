import { Context, Next } from 'hono'

interface RateLimitOptions {
  windowMs: number
  maxRequests: number
  message?: string
}

// In-memory store for rate limiting (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export function rateLimitMiddleware(options: RateLimitOptions) {
  return async (c: Context, next: Next) => {
    const clientId = c.req.header('x-forwarded-for') || 
                     c.req.header('x-real-ip') || 
                     'unknown'
    
    const now = Date.now()
    const key = `${clientId}-${c.req.path}`
    
    const clientData = rateLimitStore.get(key)
    
    if (!clientData || now > clientData.resetTime) {
      // Reset or create new entry
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + options.windowMs
      })
      await next()
      return
    }
    
    if (clientData.count >= options.maxRequests) {
      return c.json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: options.message || 'Too many requests'
        }
      }, 429)
    }
    
    // Increment counter
    clientData.count++
    rateLimitStore.set(key, clientData)
    
    await next()
  }
}