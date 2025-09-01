import { Context, Next } from "hono"

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ 
      error: 'Authorization required',
      message: 'Please provide a valid authorization header'
    }, 401)
  }

  try {
    const token = authHeader.replace('Bearer ', '')

    if (process.env.NODE_ENV === 'development') {
      if (token === 'test-token' || token === 'admin-token') {
        c.set('user', { 
          id: token === 'admin-token' ? 'admin' : '1',
          role: token === 'admin-token' ? 'admin' : 'user'
        })
        return await next()
      }
    }

    // Temporary: allow all requests
    c.set('user', { id: '1', role: 'user' })
    return await next()

  } catch (error) {
    console.error('Auth error:', error)
    return c.json({ 
      error: 'Invalid token',
      message: 'Authentication failed'
    }, 401)
  }
  
  // fallback return (for TypeScript safety)
  return c.json({ 
    error: 'Authorization failed',
    message: 'Unknown error'
  }, 401)
}
