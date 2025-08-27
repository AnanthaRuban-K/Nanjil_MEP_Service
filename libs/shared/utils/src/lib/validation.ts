import { z } from 'zod';

// Phone number validation for Indian mobile numbers
export const phoneSchema = z.string().regex(
  /^[6-9]\d{9}$/,
  'Invalid mobile number. Must be 10 digits starting with 6-9'
);

// Tamil text validation
export const tamilTextSchema = z.string().refine(
  (text) => /[\u0B80-\u0BFF]/.test(text) || /[a-zA-Z]/.test(text),
  'Please enter text in Tamil or English'
);

// Booking validation schemas
export const bookingValidationSchema = z.object({
  serviceType: z.enum(['electrical', 'plumbing']),
  description: z.string().min(10, 'Please describe the problem in detail (minimum 10 characters)'),
  contactInfo: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    phone: phoneSchema,
    address: z.string().min(20, 'Please provide complete address (minimum 20 characters)')
  }),
  scheduledTime: z.string().datetime('Invalid date and time'),
  photos: z.array(z.string().url()).optional(),
  location: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180)
  }).optional(),
  priority: z.enum(['normal', 'urgent', 'emergency']).default('normal')
});

// Product validation schema
export const productValidationSchema = z.object({
  name_ta: tamilTextSchema.min(2, 'Tamil name required'),
  name_en: z.string().min(2, 'English name required'),
  category: z.enum(['electrical', 'plumbing', 'tools']),
  price: z.number().positive('Price must be positive'),
  stockQuantity: z.number().nonnegative('Stock cannot be negative'),
  reorderLevel: z.number().nonnegative('Reorder level cannot be negative'),
  images: z.array(z.string().url()).min(1, 'At least one image required')
});

// User profile validation
export const userProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: phoneSchema.optional(),
  address: z.string().min(10, 'Please provide complete address').optional(),
  language: z.enum(['ta', 'en']).default('ta')
});