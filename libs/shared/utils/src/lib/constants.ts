export const SERVICE_TYPES = {
  ELECTRICAL: 'electrical' as const,
  PLUMBING: 'plumbing' as const,
} as const;

export const BOOKING_STATUSES = {
  PENDING: 'pending' as const,
  CONFIRMED: 'confirmed' as const,
  IN_PROGRESS: 'in-progress' as const,
  COMPLETED: 'completed' as const,
  CANCELLED: 'cancelled' as const,
} as const;

export const PRIORITIES = {
  NORMAL: 'normal' as const,
  URGENT: 'urgent' as const,
  EMERGENCY: 'emergency' as const,
} as const;

export const TEAM_STATUSES = {
  AVAILABLE: 'available' as const,
  BUSY: 'busy' as const,
  OFF_DUTY: 'off-duty' as const,
} as const;

export const LANGUAGES = {
  TAMIL: 'ta' as const,
  ENGLISH: 'en' as const,
} as const;

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/api/auth/login',
  PROFILE: '/api/auth/profile',
  
  // Bookings
  BOOKINGS: '/api/bookings',
  MY_BOOKINGS: '/api/bookings/my',
  CANCEL_BOOKING: '/api/bookings/:id/cancel',
  RATE_BOOKING: '/api/bookings/:id/feedback',
  
  // Admin
  ADMIN_DASHBOARD: '/api/admin/dashboard',
  ADMIN_BOOKINGS: '/api/admin/bookings',
  ASSIGN_TEAM: '/api/admin/bookings/:id/assign',
  UPDATE_STATUS: '/api/admin/bookings/:id/status',
  
  // Teams
  TEAMS: '/api/admin/teams',
  TEAM_PERFORMANCE: '/api/admin/teams/:id/performance',
  UPDATE_TEAM_STATUS: '/api/admin/teams/:id/status',
  
  // Products
  PRODUCTS: '/api/products',
  ADMIN_PRODUCTS: '/api/admin/products',
  INVENTORY: '/api/admin/inventory',
  REPORTS: '/api/admin/reports',
} as const;

export const EMERGENCY_CONTACTS = {
  MAIN: '1800-NANJIL',
  WHATSAPP: '919876500000',
  EMAIL: 'emergency@nanjilmep.com',
} as const;

