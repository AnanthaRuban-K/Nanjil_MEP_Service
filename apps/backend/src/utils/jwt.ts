import jwt from 'jsonwebtoken'
import type { User } from '../types'

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key'
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'your-refresh-secret-key'

export interface TokenPayload {
  userId: string
  role: string
  language: string
}

export function generateTokens(user: User) {
  const payload: TokenPayload = {
    userId: user.id,
    role: user.role,
    language: user.language
  }

  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' })
  const refreshToken = jwt.sign(payload, REFRESH_SECRET, { expiresIn: '7d' })

  return { accessToken, refreshToken }
}

export function verifyAccessToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload
  } catch (error) {
    throw new Error('Invalid access token')
  }
}

export function verifyRefreshToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, REFRESH_SECRET) as TokenPayload
  } catch (error) {
    throw new Error('Invalid refresh token')
  }
}