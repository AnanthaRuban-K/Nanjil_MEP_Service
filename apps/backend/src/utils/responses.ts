// apps/backend/src/utils/responses.ts - Fixed and Simplified
import { Context } from 'hono';

// Fix: Use explicit status codes that Hono accepts
export const successResponse = (c: Context, data: any, message?: string) => {
  return c.json({
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
  }); // Default 200 - no need to specify
};

export const createdResponse = (c: Context, data: any, message?: string) => {
  return c.json({
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
  }, 201);
};

export const errorResponse = (c: Context, error: string, message?: string) => {
  return c.json({
    success: false,
    error,
    message,
    timestamp: new Date().toISOString(),
  }, 400);
};

export const unauthorizedResponse = (c: Context, message = 'Authentication required') => {
  return c.json({
    success: false,
    error: 'Unauthorized',
    message,
    timestamp: new Date().toISOString(),
  }, 401);
};

export const forbiddenResponse = (c: Context, message = 'Access forbidden') => {
  return c.json({
    success: false,
    error: 'Forbidden',
    message,
    timestamp: new Date().toISOString(),
  }, 403);
};

export const notFoundResponse = (c: Context, message = 'Resource not found') => {
  return c.json({
    success: false,
    error: 'Not Found',
    message,
    timestamp: new Date().toISOString(),
  }, 404);
};

export const serverErrorResponse = (c: Context, message = 'Internal server error') => {
  return c.json({
    success: false,
    error: 'Server Error',
    message,
    timestamp: new Date().toISOString(),
  }, 500);
};

export const paginatedResponse = (
  c: Context,
  data: any[],
  total: number,
  page: number,
  limit: number,
  message?: string
) => {
  const totalPages = Math.ceil(total / limit);
  
  return c.json({
    success: true,
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
    message,
    timestamp: new Date().toISOString(),
  }); // Default 200
};