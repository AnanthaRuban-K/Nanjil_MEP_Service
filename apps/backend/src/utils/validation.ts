import { z } from 'zod';

export const bookingCreateSchema = z.object({
  serviceType: z.enum(['electrical', 'plumbing']),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  photos: z.array(z.string().url()).optional().default([]),
  contactInfo: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid mobile number'),
    address: z.string().min(20, 'Address must be at least 20 characters'),
  }),
  location: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }).optional(),
  scheduledTime: z.string().datetime('Invalid date format'),
  priority: z.enum(['normal', 'urgent', 'emergency']).default('normal'),
});

export const teamCreateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid mobile number'),
  skills: z.array(z.enum(['electrical', 'plumbing'])).min(1, 'At least one skill required'),
  vehicleInfo: z.object({
    type: z.string().min(2, 'Vehicle type required'),
    number: z.string().min(5, 'Vehicle number required'),
  }).optional(),
  emergencyContact: z.string().regex(/^[6-9]\d{9}$/, 'Invalid emergency contact number'),
});

export const productCreateSchema = z.object({
  nameEn: z.string().min(2, 'English name required'),
  nameTa: z.string().min(2, 'Tamil name required'),
  category: z.enum(['electrical', 'plumbing', 'tools']),
  price: z.number().positive('Price must be positive'),
  stockQuantity: z.number().nonnegative('Stock quantity cannot be negative'),
  reorderLevel: z.number().nonnegative('Reorder level cannot be negative').default(5),
  images: z.array(z.string().url()).min(1, 'At least one image required'),
  descriptionEn: z.string().optional(),
  descriptionTa: z.string().optional(),
  supplierInfo: z.object({
    name: z.string().min(2, 'Supplier name required'),
    contact: z.string().min(10, 'Supplier contact required'),
  }).optional(),
});