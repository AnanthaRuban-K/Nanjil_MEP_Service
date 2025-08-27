export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
    PROFILE: '/api/auth/profile',
    REFRESH: '/api/auth/refresh',
    LOGOUT: '/api/auth/logout',
  },

  // Customer Bookings
  BOOKINGS: {
    CREATE: '/api/bookings',
    MY_BOOKINGS: '/api/bookings/my',
    DETAILS: (id: string) => `/api/bookings/${id}`,
    CANCEL: (id: string) => `/api/bookings/${id}/cancel`,
    FEEDBACK: (id: string) => `/api/bookings/${id}/feedback`,
  },

  // Services
  SERVICES: {
    LIST: '/api/services',
    CATEGORIES: '/api/services/categories',
    AREAS: '/api/services/areas',
    EMERGENCY: '/api/services/emergency',
  },

  // Products
  PRODUCTS: {
    LIST: '/api/products',
    DETAILS: (id: string) => `/api/products/${id}`,
    CART: '/api/products/cart',
    CATEGORIES: '/api/products/categories',
  },

  // Admin Dashboard
  ADMIN: {
    DASHBOARD: '/api/admin/dashboard',
    BOOKINGS: '/api/admin/bookings',
    BOOKING_ASSIGN: (id: string) => `/api/admin/bookings/${id}/assign`,
    BOOKING_STATUS: (id: string) => `/api/admin/bookings/${id}/status`,
    
    // Team Management
    TEAMS: '/api/admin/teams',
    TEAM_STATUS: (id: string) => `/api/admin/teams/${id}/status`,
    TEAM_PERFORMANCE: (id: string) => `/api/admin/teams/${id}/performance`,
    
    // Inventory Management
    INVENTORY: '/api/admin/inventory',
    INVENTORY_UPDATE: (id: string) => `/api/admin/inventory/${id}`,
    PRODUCTS_MANAGE: '/api/admin/products',
    
    // Reports
    REPORTS: {
      BUSINESS: '/api/admin/reports/business',
      INVENTORY: '/api/admin/reports/inventory',
      TEAM_PERFORMANCE: '/api/admin/reports/team-performance',
      EXPORT: '/api/admin/reports/export',
    },
    
    // Notifications
    NOTIFICATIONS: {
      SEND: '/api/admin/notifications/send',
      HISTORY: '/api/admin/notifications/history',
    },
  },

  // File Uploads
  UPLOADS: {
    BOOKING_PHOTOS: '/api/uploads/booking-photos',
    PRODUCT_IMAGES: '/api/uploads/product-images',
    COMPLETION_PHOTOS: '/api/uploads/completion-photos',
    FEEDBACK_PHOTOS: '/api/uploads/feedback-photos',
  },

  // WebSocket
  WEBSOCKET: '/api/websocket',
} as const