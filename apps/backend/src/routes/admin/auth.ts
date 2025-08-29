import { Hono } from 'hono'
import { sign, verify } from 'hono/jwt'
import bcrypt from 'bcryptjs'

const adminAuthRoute = new Hono()

// Admin credentials (in production, store in database)
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: '$2a$10$hashed_password', // bcrypt hash
  adminKey: process.env.ADMIN_SECRET_KEY || 'nanjil-mep-admin-2024'
}

// Admin login
adminAuthRoute.post('/login', async (c) => {
  const { username, password, adminKey } = await c.req.json()
  
  try {
    // Validate credentials
    if (username !== ADMIN_CREDENTIALS.username) {
      return c.json({ success: false, error: 'Invalid credentials' }, 401)
    }
    
    if (adminKey !== ADMIN_CREDENTIALS.adminKey) {
      return c.json({ success: false, error: 'Invalid admin key' }, 401)
    }
    
    const isValidPassword = await bcrypt.compare(password, ADMIN_CREDENTIALS.password)
    if (!isValidPassword) {
      return c.json({ success: false, error: 'Invalid credentials' }, 401)
    }
    
    // Generate JWT token
    const token = await sign(
      { 
        username, 
        role: 'admin',
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
      },
      process.env.JWT_SECRET || 'your-secret-key'
    )
    
    return c.json({
      success: true,
      token,
      user: {
        username,
        role: 'admin',
        name: 'System Administrator',
        permissions: ['all']
      }
    })
  } catch (error) {
    return c.json({ success: false, error: 'Login failed' }, 500)
  }
})

// Verify admin token middleware
export const adminAuth = async (c: any, next: any) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ success: false, error: 'No token provided' }, 401)
  }
  
  const token = authHeader.split(' ')[1]
  
  try {
    const payload = await verify(token, process.env.JWT_SECRET || 'your-secret-key')
    if (payload.role !== 'admin') {
      return c.json({ success: false, error: 'Admin access required' }, 403)
    }
    
    c.set('admin', payload)
    await next()
  } catch (error) {
    return c.json({ success: false, error: 'Invalid token' }, 401)
  }
}

export { adminAuthRoute }