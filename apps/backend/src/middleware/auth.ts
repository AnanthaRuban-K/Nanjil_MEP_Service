import { Context, Next } from 'hono'
import { db } from '../db/index'
import { users } from '../db/schema'
import { eq } from 'drizzle-orm'
import { verifyAccessToken } from '../utils/jwt'
import type { User } from '../types'

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({
      success: false,
      error: { 
        code: 'UNAUTHORIZED',
        message: 'Authorization token required' 
      }
    }, 401)
  }

  const token = authHeader.substring(7)
  
  try {
    const payload = verifyAccessToken(token)
    
    // Fetch user from database
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.id, payload.userId))
      .limit(1)

    if (!userResult.length || !userResult[0].isActive) {
      return c.json({
        success: false,
        error: { 
          code: 'USER_NOT_FOUND',
          message: 'User not found or inactive' 
        }
      }, 401)
    }

    // Attach user to context
    c.set('user', userResult[0])
    await next()
  } catch (error) {
    return c.json({
      success: false,
      error: { 
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired token' 
      }
    }, 401)
  }
}

export async function requireAdmin(c: Context, next: Next) {
  // First run auth middleware
  await authMiddleware(c, async () => {})
  
  const user = c.get('user') as User
  
  if (!user || user.role !== 'admin') {
    return c.json({
      success: false,
      error: { 
        code: 'ADMIN_REQUIRED',
        message: 'Admin access required' 
      }
    }, 403)
  }

  await next()
}

export async function requireTeamMember(c: Context, next: Next) {
  await authMiddleware(c, async () => {})
  
  const user = c.get('user') as User
  
  if (!user || (user.role !== 'team_member' && user.role !== 'admin')) {
    return c.json({
      success: false,
      error: { 
        code: 'TEAM_ACCESS_REQUIRED',
        message: 'Team member access required' 
      }
    }, 403)
  }

  await next()
}