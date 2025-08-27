import { Context } from 'hono'
import { HTTPException } from 'hono/http-exception'

export function errorHandler(err: Error, c: Context) {
  console.error('Application Error:', err)
  
  if (err instanceof HTTPException) {
    return c.json({
      success: false,
      error: {
        code: 'HTTP_EXCEPTION',
        message: err.message
      }
    }, err.status)
  }
  
  // Database errors
  if (err.message.includes('unique constraint')) {
    return c.json({
      success: false,
      error: {
        code: 'DUPLICATE_ENTRY',
        message: 'Record already exists'
      }
    }, 409)
  }
  
  if (err.message.includes('foreign key constraint')) {
    return c.json({
      success: false,
      error: {
        code: 'INVALID_REFERENCE',
        message: 'Invalid reference in request'
      }
    }, 400)
  }
  
  // Generic server error
  return c.json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred'
    }
  }, 500)
}
