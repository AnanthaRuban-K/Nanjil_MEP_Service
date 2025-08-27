import { Context, Next } from 'hono'
import { z } from 'zod'

export function validateRequest(schema: z.ZodSchema) {
  return async (c: Context, next: Next) => {
    try {
      let data: any

      const contentType = c.req.header('content-type') || ''
      
      if (contentType.includes('application/json')) {
        data = await c.req.json()
      } else if (contentType.includes('multipart/form-data')) {
  const formData = await c.req.formData()

  // tell TS explicitly
  const entries = (formData as any).entries() as Iterable<[string, FormDataEntryValue]>
  data = Object.fromEntries(entries)

  // Handle file uploads
  for (const [key, value] of entries) {
    if (value instanceof File) {
      data[key] = value
    }
  }
}
 else {
        // Query parameters and form data
        data = { ...c.req.query(), ...await c.req.parseBody() }
      }

      const validatedData = schema.parse(data)
      c.set('validatedData', validatedData)
      
      await next()
    } catch (error) {
      if (error instanceof z.ZodError) {
        return c.json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: error.errors.map(err => ({
              field: err.path.join('.'),
              message: err.message
            }))
          }
        }, 400)
      }
      
      console.error('Validation middleware error:', error)
      return c.json({
        success: false,
        error: {
          code: 'VALIDATION_FAILED',
          message: 'Request validation failed'
        }
      }, 400)
    }
  }
}