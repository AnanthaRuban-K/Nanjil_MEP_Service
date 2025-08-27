// ===========================
// types/index.ts - Complete Type Definitions
// ===========================

import { InferSelectModel, InferInsertModel } from 'drizzle-orm'

// ====== ENUM TYPES ======
export type Language = 'ta' | 'en'
export type UserRole = 'customer' | 'admin' | 'team_member'
export type ServiceType = 'electrical' | 'plumbing'
export type BookingStatus = 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled'
export type BookingPriority = 'normal' | 'urgent' | 'emergency'
export type TeamStatus = 'available' | 'busy' | 'off-duty' | 'maintenance'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'partial'
export type PaymentMethod = 'cash' | 'upi' | 'card' | 'bank_transfer'
export type ProductCategory = 'electrical' | 'plumbing' | 'tools' | 'accessories'
export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'discontinued'
export type NotificationType = 'sms' | 'whatsapp' | 'email' | 'push' | 'in_app'
export type NotificationStatus = 'pending' | 'sent' | 'delivered' | 'failed' | 'read'

// ====== BASIC TYPES ======
export interface Location {
  lat: number
  lng: number
  address?: string
  pincode?: string
  landmark?: string
  lastUpdated?: string
}

export interface ContactInfo {
  name: string
  phone: string
  email?: string
  address: string
  alternatePhone?: string
  whatsappNumber?: string
}

export interface TimeSlot {
  id: string
  startTime: string
  endTime: string
  isAvailable: boolean
  price?: number
  label_ta: string
  label_en: string
}

// ====== DATABASE MODEL TYPES ======
// Note: These would be imported from your actual schema file
// export type User = InferSelectModel<typeof users>
// export type NewUser = InferInsertModel<typeof users>
// For now, we'll define them explicitly

// ====== USER TYPES ======
export interface User {
  id: string
  clerkUserId?: string
  name: string
  phone: string
  email?: string
  address?: string
  alternatePhone?: string
  whatsappNumber?: string
  role: UserRole
  language: Language
  isVerified: boolean
  isActive: boolean
  profileImage?: string
  dateOfBirth?: string
  gender?: 'male' | 'female' | 'other'
  occupation?: string
  // Statistics
  totalBookings: number
  completedBookings: number
  cancelledBookings: number
  averageRating: number
  totalSpent: number
  loyaltyPoints: number
  // Preferences
  preferredServiceTime?: 'morning' | 'afternoon' | 'evening' | 'flexible'
  emergencyContact?: ContactInfo
  notifications: {
    sms: boolean
    whatsapp: boolean
    email: boolean
    push: boolean
  }
  // Location
  defaultLocation?: Location
  serviceAreas?: string[]
  // Timestamps
  joinedDate: string
  lastLoginAt?: string
  lastBookingAt?: string
  createdAt: string
  updatedAt: string
}

export interface UserPreferences {
  language: Language
  theme: 'light' | 'dark' | 'system'
  notifications: {
    sms: boolean
    whatsapp: boolean
    email: boolean
    push: boolean
    marketing: boolean
  }
  privacy: {
    showPhone: boolean
    showEmail: boolean
    allowTracking: boolean
  }
  accessibility: {
    fontSize: 'small' | 'medium' | 'large'
    highContrast: boolean
    screenReader: boolean
  }
}

export interface AdminUser extends User {
  role: 'admin'
  permissions: string[]
  adminLevel: 'super' | 'manager' | 'operator'
  accessLevel: number
  lastAdminAction?: string
  managedAreas?: string[]
}

export interface TeamMember {
  id: string
  userId?: string
  name: string
  role: string
  phone: string
  email?: string
  experience: string
  skills: ServiceType[]
  certifications?: string[]
  aadharNumber?: string
  panNumber?: string
  licenseNumber?: string
  profileImage?: string
  isLead: boolean
  joinedAt: string
  salary?: number
  bankDetails?: {
    accountNumber: string
    ifscCode: string
    bankName: string
    accountHolder: string
  }
  emergencyContact?: ContactInfo
  workingHours: {
    start: string
    end: string
    daysOff: string[]
  }
  createdAt: string
  updatedAt: string
}

// ====== AUTHENTICATION TYPES ======
export interface LoginRequest {
  phone: string
  otp: string
  deviceId?: string
  fcmToken?: string
}

export interface RegisterRequest {
  name: string
  phone: string
  email?: string
  address?: string
  language: Language
  location?: Location
  referralCode?: string
  acceptedTerms: boolean
  marketingConsent?: boolean
}

export interface AuthRequest {
  phone: string
  otp: string
  deviceId?: string
  fcmToken?: string
}

export interface AuthResponse {
  success: boolean
  user: User
  token: string
  refreshToken: string
  isAdmin: boolean
  expiresIn: string
  message: string
  isNewUser: boolean
  onboardingComplete: boolean
}

export interface RefreshTokenRequest {
  refreshToken: string
  deviceId?: string
}

// ====== SERVICE TYPES ======
export interface Service {
  id: string
  name_ta: string
  name_en: string
  category: ServiceType
  subcategory?: string
  description_ta: string
  description_en: string
  basePrice: number
  priceRange?: {
    min: number
    max: number
  }
  estimatedTime: string
  estimatedTimeRange?: {
    min: number // in minutes
    max: number
  }
  isActive: boolean
  isEmergency: boolean
  requiresAssessment: boolean
  images: string[]
  icon?: string
  tags: string[]
  popularity: number
  averageRating: number
  totalBookings: number
  seasonalPricing?: {
    season: string
    multiplier: number
    startDate: string
    endDate: string
  }[]
  workingHours?: {
    start: string
    end: string
    days: string[]
  }
  createdAt: string
  updatedAt: string
}

export interface ServiceSubcategory {
  id: string
  serviceId: string
  name_ta: string
  name_en: string
  description_ta: string
  description_en: string
  basePrice: number
  estimatedTime: string
  isEmergency: boolean
  requiresSpecialist: boolean
  commonIssues: {
    issue_ta: string
    issue_en: string
    estimatedTime: string
    basePrice: number
  }[]
  images: string[]
  tools: string[]
}

export interface ServiceArea {
  id: string
  name_ta: string
  name_en: string
  pincode: string
  city: string
  state: string
  coordinates: {
    lat: number
    lng: number
    radius: number // in km
  }
  estimatedArrival: string
  serviceCharge: number
  isActive: boolean
  priority: number
  coveredServices: ServiceType[]
  restrictions?: string[]
  additionalCharges?: {
    nightTime: number // 10 PM to 6 AM
    holiday: number
    emergency: number
  }
  createdAt: string
  updatedAt: string
}

// ====== BOOKING TYPES ======
export interface Booking {
  eta: string
  id: string
  bookingNumber: string
  customerId: string
  customer?: User
  serviceId?: string
  service?: Service
  serviceType: ServiceType
  subcategory?: string
  status: BookingStatus
  priority: BookingPriority
  title: string
  description: string
  scheduledTime: string
  actualStartTime?: string
  actualEndTime?: string
  estimatedArrival?: string
  estimatedDuration?: string
  estimatedCompletion?: string
  completionTime?: string
  // Contact & Location
  contactInfo: ContactInfo
  location?: Location
  serviceArea?: ServiceArea
  // Media
  photos: string[]
  beforePhotos?: string[]
  afterPhotos?: string[]
  videoUrl?: string
  // Team & Assignment
  assignedTeamId?: string
  assignedTeam?: Team
  assignedAt?: string
  reassignmentCount: number
  previousTeams?: string[]
  // Pricing & Payment
  quotedPrice?: number
  finalPrice?: number
  discountAmount?: number
  taxAmount?: number
  totalAmount?: number
  paymentStatus: PaymentStatus
  paymentMethod?: PaymentMethod
  advanceAmount?: number
  balanceAmount?: number
  // Materials & Parts
  partsUsed?: PartUsed[]
  materialCost?: number
  labourCost?: number
  // Quality & Feedback
  rating?: number
  review?: string
  reviewPhotos?: string[]
  serviceAspects?: {
    punctuality: number
    quality: number
    politeness: number
    pricing: number
    cleanliness: number
  }
  wouldRecommend?: boolean
  // Status & Permissions
  canCancel: boolean
  canReschedule: boolean
  canRate: boolean
  cancellationReason?: string
  rescheduleReason?: string
  // Tracking
  statusHistory: BookingStatusHistory[]
  timeline: BookingTimelineEvent[]
  trackingUpdates?: TrackingUpdate[]
  // Admin
  adminNotes?: string
  internalNotes?: string
  qualityScore?: number
  issueFlags?: string[]
  // Timestamps
  createdAt: string
  updatedAt: string
  cancelledAt?: string
  completedAt?: string
}

export interface BookingStatusHistory {
  id: string
  bookingId: string
  status: BookingStatus
  previousStatus?: BookingStatus
  title_ta: string
  title_en: string
  description_ta: string
  description_en: string
  note?: string
  changedBy?: string
  changedByName?: string
  timestamp: string
  metadata?: Record<string, any>
}

export interface BookingTimelineEvent {
  id: string
  type: 'status' | 'assignment' | 'payment' | 'communication' | 'issue'
  title_ta: string
  title_en: string
  description_ta: string
  description_en: string
  timestamp: string
  actor?: string
  actorName?: string
  icon?: string
  color?: string
  metadata?: Record<string, any>
}

export interface TrackingUpdate {
  id: string
  bookingId: string
  teamLocation?: Location
  distanceFromDestination?: string
  estimatedArrival?: string
  status?: string
  message_ta?: string
  message_en?: string
  timestamp: string
}

export interface CreateBookingRequest {
  serviceType: ServiceType
  serviceId?: string
  subcategory?: string
  title: string
  description: string
  photos?: File[] | string[]
  contactInfo: ContactInfo
  location?: Location
  scheduledTime: string
  priority?: BookingPriority
  additionalRequirements?: string
  preferredTeam?: string
  budgetRange?: {
    min: number
    max: number
  }
  urgentReason?: string
  accessInstructions?: string
  specialInstructions?: string
}

export interface UpdateBookingRequest {
  title?: string
  description?: string
  scheduledTime?: string
  priority?: BookingPriority
  contactInfo?: Partial<ContactInfo>
  location?: Location
  additionalRequirements?: string
  specialInstructions?: string
}

export interface CancelBookingRequest {
  reason: string
  category: 'time_conflict' | 'cost_issue' | 'found_alternative' | 'emergency' | 'other'
  reschedule?: boolean
  preferredRescheduleTime?: string
  additionalComments?: string
}

export interface RescheduleBookingRequest {
  newScheduledTime: string
  reason: string
  additionalComments?: string
}

export interface UpdateBookingStatusRequest {
  status: BookingStatus
  notes?: string
  estimatedCompletion?: string
  actualStartTime?: string
  actualEndTime?: string
  completionPhotos?: string[]
  partsUsed?: {
    productId: string
    quantity: number
    unitPrice: number
  }[]
  paymentReceived?: number
  paymentMethod?: PaymentMethod
  qualityCheckPassed?: boolean
  customerSatisfied?: boolean
  issuesEncountered?: string[]
  nextSteps?: string
  warrantyPeriod?: string
  followUpRequired?: boolean
  internalNotes?: string
}

export interface AssignTeamRequest {
  teamId: string
  notes?: string
  priority?: BookingPriority
  estimatedArrival?: string
  specialInstructions?: string
  equipmentNeeded?: string[]
  override?: boolean // Force assignment even if team is busy
}

// ====== TEAM TYPES ======
export interface TeamPerformance {
  totalJobs: number
  completedJobs: number
  cancelledJobs: number
  averageRating: number
  averageJobTime: string // in minutes
  averageResponseTime: string // time to reach customer
  onTimePercentage: number
  completionRate: number
  customerSatisfactionScore: number
  reworkRate: number
  efficiency: number
  productivity: number
  // Recent performance (last 30 days)
  recentJobs: number
  recentRating: number
  recentCompletion: number
  // Issues
  customerComplaints: number
  qualityIssues: number
  safetyViolations: number
  // Revenue
  totalRevenue: number
  averageJobValue: number
  upsellRate: number
}

export interface TeamStatistics {
  todayStats: {
    jobsScheduled: number
    jobsCompleted: number
    hoursWorked: number
    distanceTraveled: number
    revenue: number
    customerRatings: number[]
    averageRating: number
  }
  weekStats: {
    jobsCompleted: number
    hoursWorked: number
    revenue: number
    averageRating: number
    completionRate: number
  }
  monthStats: {
    jobsCompleted: number
    revenue: number
    averageRating: number
    customerRetention: number
    growthRate: number
  }
}

export interface TeamAvailability {
  isAvailable: boolean
  availabilityStatus: 'free' | 'busy' | 'break' | 'travel' | 'offline'
  nextAvailable?: string
  estimatedFree?: string
  currentCapacity: number
  maxCapacity: number
  upcomingBookings: {
    bookingId: string
    scheduledTime: string
    estimatedDuration: string
    serviceType: ServiceType
  }[]
  timeSlots: {
    date: string
    slots: TimeSlot[]
  }[]
  unavailableDates?: string[]
  breakTimes?: {
    start: string
    end: string
    reason: string
  }[]
}

export interface Team {
  id: string
  name: string
  displayName: string
  description?: string
  teamLead?: string
  members: TeamMember[]
  skills: ServiceType[]
  specializations: string[]
  status: TeamStatus
  phone: string
  email?: string
  whatsappNumber?: string
  // Location & Movement
  currentLocation?: Location
  baseLocation?: Location
  serviceRadius: number // in km
  currentJobId?: string
  currentJob?: {
    bookingId: string
    bookingNumber: string
    customerName: string
    serviceType: ServiceType
    startTime: string
    estimatedCompletion: string
    location: Location
    priority: BookingPriority
  }
  // Equipment & Vehicle
  vehicle?: {
    type: 'bike' | 'car' | 'van' | 'truck'
    number: string
    model?: string
    fuelType?: 'petrol' | 'diesel' | 'electric' | 'cng'
    fuelStatus?: 'full' | 'half' | 'low' | 'empty'
    hasToolkit: boolean
    hasGPS: boolean
    insuranceExpiry?: string
    pollutionExpiry?: string
  }
  equipment: {
    name: string
    category: string
    condition: 'excellent' | 'good' | 'fair' | 'needs_repair'
    lastMaintenance?: string
  }[]
  // Performance Metrics
  performance: TeamPerformance
  statistics: TeamStatistics
  // Availability
  availability: TeamAvailability
  workingHours: {
    monday: { start: string; end: string; isWorking: boolean }
    tuesday: { start: string; end: string; isWorking: boolean }
    wednesday: { start: string; end: string; isWorking: boolean }
    thursday: { start: string; end: string; isWorking: boolean }
    friday: { start: string; end: string; isWorking: boolean }
    saturday: { start: string; end: string; isWorking: boolean }
    sunday: { start: string; end: string; isWorking: boolean }
  }
  // Service Areas
  serviceAreas: string[]
  excludedAreas?: string[]
  // Preferences
  preferredServiceTypes?: ServiceType[]
  maxJobsPerDay: number
  isEmergencyAvailable: boolean
  emergencyContactNumber?: string
  // Ratings & Reviews
  rating: number
  totalRatings: number
  reviewCount: number
  completedJobs: number
  // Admin
  isActive: boolean
  notes?: string
  warnings?: string[]
  // Timestamps
  createdAt: string
  updatedAt: string
  lastActiveAt?: string
}

export interface CreateTeamRequest {
  name: string
  displayName?: string
  description?: string
  members: {
    name: string
    role: string
    phone: string
    email?: string
    experience: string
    skills: ServiceType[]
    certifications?: string[]
    isLead: boolean
    salary?: number
    workingHours: {
      start: string
      end: string
      daysOff: string[]
    }
  }[]
  skills: ServiceType[]
  specializations?: string[]
  phone: string
  email?: string
  baseLocation?: Location
  serviceRadius?: number
  vehicle?: {
    type: 'bike' | 'car' | 'van' | 'truck'
    number: string
    model?: string
    fuelType?: string
    hasGPS: boolean
  }
  equipment: {
    name: string
    category: string
    condition: string
  }[]
  workingHours: Record<string, { start: string; end: string; isWorking: boolean }>
  serviceAreas: string[]
  maxJobsPerDay?: number
  isEmergencyAvailable?: boolean
}

export interface UpdateTeamStatusRequest {
  status: TeamStatus
  location?: Location
  availabilityStatus?: TeamAvailability['availabilityStatus']
  notes?: string
  estimatedFree?: string
  currentCapacity?: number
  reasonForChange?: string
  nextAvailableTime?: string
}

// ====== PRODUCT TYPES ======
export interface ProductSupplier {
  id: string
  name: string
  contactPerson: string
  phone: string
  email?: string
  address?: string
  gstNumber?: string
  paymentTerms?: string
  deliveryTime?: string
  minimumOrderQuantity?: number
  lastOrderDate?: string
  lastOrderAmount?: number
  rating?: number
  isActive: boolean
}

export interface ProductSalesData {
  soldToday: number
  soldThisWeek: number
  soldThisMonth: number
  soldLastMonth: number
  averageMonthlySales: number
  peakSalesMonth?: string
  lowSalesMonth?: string
  seasonalTrends?: {
    season: string
    averageSales: number
  }[]
  customerSegments?: {
    segment: string
    salesPercentage: number
  }[]
}

export interface Product {
  id: string
  sku: string
  name_ta: string
  name_en: string
  brand?: string
  model?: string
  category: ProductCategory
  subcategory?: string
  description_ta?: string
  description_en?: string
  shortDescription_ta?: string
  shortDescription_en?: string
  // Pricing
  costPrice: number
  sellingPrice: number
  mrp?: number
  discountPercentage?: number
  finalPrice: number
  taxRate?: number
  taxAmount?: number
  // Inventory
  stockQuantity: number
  reservedQuantity: number
  availableQuantity: number
  minStockLevel: number
  maxStockLevel: number
  reorderPoint: number
  stockStatus: StockStatus
  // Physical Properties
  weight?: number
  dimensions?: {
    length: number
    width: number
    height: number
    unit: 'cm' | 'inch'
  }
  color?: string
  material?: string
  // Media
  images: string[]
  thumbnailImage?: string
  videoUrl?: string
  documents?: string[] // manuals, certificates
  // Specifications
  specifications: Record<string, any>
  technicalSpecs?: Record<string, any>
  features: string[]
  compatibility?: string[]
  // Supplier Information
  supplier?: ProductSupplier
  manufacturerDetails?: {
    name: string
    country: string
    warrantyPeriod?: string
    supportContact?: string
  }
  // Sales & Reviews
  averageRating: number
  totalReviews: number
  totalSales: number
  salesData: ProductSalesData
  // Availability
  isActive: boolean
  isAvailable: boolean
  isFeatured: boolean
  isNewArrival: boolean
  isBestSeller: boolean
  // Shipping & Delivery
  deliveryTime?: string
  shippingWeight?: number
  packagingInfo?: string
  handlingInstructions?: string
  // Warranty & Service
  warrantyPeriod?: string
  serviceAvailable: boolean
  installationRequired: boolean
  installationCharge?: number
  // SEO & Marketing
  tags: string[]
  searchKeywords: string[]
  metaTitle?: string
  metaDescription?: string
  // Timestamps
  lastRestocked?: string
  expiryDate?: string
  createdAt: string
  updatedAt: string
}

export interface ProductCategoryInterface {
  id: string
  name_ta: string
  name_en: string
  description_ta?: string
  description_en?: string
  icon?: string
  image?: string
  parentCategoryId?: string
  subcategories?: ProductCategoryInterface[]
  productCount: number
  isActive: boolean
  sortOrder: number
  seoData?: {
    slug: string
    metaTitle: string
    metaDescription: string
    keywords: string[]
  }
}

export interface CreateProductRequest {
  name_ta: string
  name_en: string
  brand?: string
  model?: string
  category: ProductCategory
  subcategory?: string
  description_ta?: string
  description_en?: string
  costPrice: number
  sellingPrice: number
  mrp?: number
  initialStock: number
  minStockLevel?: number
  maxStockLevel?: number
  weight?: number
  dimensions?: {
    length: number
    width: number
    height: number
    unit: string
  }
  specifications: Record<string, any>
  features: string[]
  images: string[] // URLs after upload
  supplier?: {
    name: string
    contactPerson: string
    phone: string
    email?: string
    gstNumber?: string
  }
  warrantyPeriod?: string
  installationRequired?: boolean
  installationCharge?: number
  tags: string[]
  isActive?: boolean
  isFeatured?: boolean
}

export interface UpdateInventoryRequest {
  operation: 'set' | 'add' | 'subtract'
  quantity: number
  reason: 'purchase' | 'sale' | 'adjustment' | 'return' | 'damage' | 'transfer'
  costPrice?: number
  sellingPrice?: number
  supplierInfo?: {
    supplierId: string
    purchaseOrderId?: string
    invoiceNumber?: string
    orderDate: string
    receivedDate: string
    batchNumber?: string
    expiryDate?: string
  }
  notes?: string
  images?: string[]
  performedBy: string
}

export interface StockMovement {
  id: string
  productId: string
  type: 'in' | 'out' | 'adjustment'
  quantity: number
  previousStock: number
  newStock: number
  reason: string
  referenceId?: string // booking, purchase order, etc.
  referenceType?: string
  unitCost?: number
  totalCost?: number
  batchNumber?: string
  expiryDate?: string
  notes?: string
  performedBy: string
  performedByName: string
  createdAt: string
}

// ====== PART USAGE TYPES ======
export interface PartUsed {
  id: string
  productId: string
  product?: Product
  name: string
  sku?: string
  brand?: string
  quantity: number
  unitPrice: number
  totalPrice: number
  costPrice?: number
  margin?: number
  category: string
  isWarrantyItem: boolean
  warrantyPeriod?: string
  supplierWarranty?: string
  installationDate?: string
  batchNumber?: string
  serialNumber?: string
  notes?: string
}

// ====== PAYMENT TYPES ======
export interface Payment {
  id: string
  bookingId: string
  booking?: Booking
  customerId: string
  customer?: User
  paymentType: 'advance' | 'full' | 'partial' | 'refund'
  amount: number
  taxAmount?: number
  discountAmount?: number
  totalAmount: number
  method: PaymentMethod
  status: PaymentStatus
  transactionId?: string
  gatewayTransactionId?: string
  gatewayResponse?: Record<string, any>
  // Online payment details
  razorpayOrderId?: string
  razorpayPaymentId?: string
  razorpaySignature?: string
  // Bank details
  bankName?: string
  accountNumber?: string
  upiId?: string
  // Cash payment details
  receivedBy?: string
  receivedByName?: string
  changeGiven?: number
  // Refund details
  refundAmount?: number
  refundReason?: string
  refundDate?: string
  // Timestamps
  paidAt?: string
  createdAt: string
  updatedAt: string
}

export interface PaymentSummary {
  totalAmount: number
  paidAmount: number
  pendingAmount: number
  refundedAmount: number
  discountAmount: number
  taxAmount: number
  payments: Payment[]
}

// ====== FEEDBACK TYPES ======
export interface Feedback {
  id: string
  bookingId: string
  booking?: Booking
  customerId: string
  customer?: User
  teamId: string
  team?: Team
  overallRating: number
  serviceAspects: {
    punctuality: number
    quality: number
    politeness: number
    pricing: number
    cleanliness: number
    communication: number
  }
  review: string
  reviewTitle?: string
  photos: string[]
  pros?: string[]
  cons?: string[]
  wouldRecommend: boolean
  wouldRebook: boolean
  improvementSuggestions?: string
  // Admin response
  adminResponse?: string
  adminResponseBy?: string
  adminResponseAt?: string
  // Status
  isPublic: boolean
  isVerified: boolean
  isPromoted: boolean
  helpfulVotes: number
  reportCount: number
  // Rewards
  earnedPoints?: number
  earnedBadges?: string[]
  // Timestamps
  createdAt: string
  updatedAt: string
}

export interface SubmitFeedbackRequest {
  overallRating: number
  serviceAspects: Feedback['serviceAspects']
  review: string
  reviewTitle?: string
  photos?: File[]
  pros?: string[]
  cons?: string[]
  wouldRecommend: boolean
  wouldRebook: boolean
  improvementSuggestions?: string
  isPublic?: boolean
}

// ====== CART & ORDER TYPES ======
export interface CartItem {
  productId: string
  product?: Product
  name_ta: string
  name_en: string
  sku?: string
  unitPrice: number
  quantity: number
  maxQuantity: number
  subtotal: number
  discount?: number
  tax?: number
  totalPrice: number
  image?: string
  isAvailable: boolean
  deliveryTime?: string
  installationRequired?: boolean
  installationCharge?: number
  warrantyPeriod?: string
  notes?: string
}

export interface Cart {
  id: string
  customerId: string
  items: CartItem[]
  itemCount: number
  subtotal: number
  discountAmount: number
  taxAmount: number
  deliveryCharge?: number
  installationCharge?: number
  totalAmount: number
  estimatedDelivery: string
  deliveryLocation?: Location
  specialInstructions?: string
  couponCode?: string
  couponDiscount?: number
  createdAt: string
  updatedAt: string
}

export interface Order {
  id: string
  orderNumber: string
  customerId: string
  customer?: User
  items: CartItem[]
  orderType: 'product_only' | 'with_service' | 'service_parts'
  relatedBookingId?: string
  relatedBooking?: Booking
  // Pricing
  subtotal: number
  discountAmount: number
  taxAmount: number
  deliveryCharge: number
  installationCharge: number
  totalAmount: number
  // Status
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  paymentStatus: PaymentStatus
  // Delivery
  deliveryAddress: ContactInfo
  deliveryLocation?: Location
  deliverySlot?: TimeSlot
  deliveryInstructions?: string
  expectedDelivery?: string
  actualDelivery?: string
  deliveredBy?: string
  // Tracking
  trackingNumber?: string
  courierPartner?: string
  statusHistory: {
    status: string
    timestamp: string
    note?: string
  }[]
  // Timestamps
  createdAt: string
  updatedAt: string
  cancelledAt?: string
  deliveredAt?: string
}

// ====== NOTIFICATION TYPES ======
export interface Notification {
  id: string
  type: NotificationType
  category: 'booking' | 'payment' | 'system' | 'marketing' | 'reminder'
  title: string
  message: string
  title_ta?: string
  message_ta?: string
  recipient: string // phone/email/userId
  recipientType: 'customer' | 'admin' | 'team'
  templateId?: string
  templateData?: Record<string, any>
  // Delivery
  status: NotificationStatus
  priority: 'low' | 'normal' | 'high' | 'urgent'
  scheduled: boolean
  scheduledAt?: string
  sentAt?: string
  deliveredAt?: string
  readAt?: string
  failedAt?: string
  // Gateway details
  gatewayId?: string
  gatewayResponse?: Record<string, any>
  // Retry logic
  retryCount: number
  maxRetries: number
  nextRetryAt?: string
  errorMessage?: string
  // Links and actions
  actionUrl?: string
  actionText?: string
  deepLink?: string
  // Tracking
  clickCount: number
  lastClickedAt?: string
  // Related entities
  bookingId?: string
  orderId?: string
  userId?: string
  // Timestamps
  createdAt: string
  updatedAt: string
}

export interface SendNotificationRequest {
  type: NotificationType
  category: Notification['category']
  recipients: {
    id: string
    phone?: string
    email?: string
    fcmToken?: string
    language: Language
    recipientType: Notification['recipientType']
  }[]
  template: string
  data: Record<string, any>
  priority?: Notification['priority']
  scheduledAt?: string
  actionUrl?: string
  actionText?: string
  batchSize?: number
}

// ====== DASHBOARD & ANALYTICS TYPES ======
export interface DashboardMetrics {
  today: {
    totalBookings: number
    newBookings: number
    completedJobs: number
    pendingJobs: number
    cancelledJobs: number
    emergencyJobs: number
    totalRevenue: number
    averageJobValue: number
    averageRating: number
    customerSatisfaction: number
    teamsActive: number
    responseTime: string
  }
  yesterday: {
    totalBookings: number
    completedJobs: number
    totalRevenue: number
    averageRating: number
  }
  thisWeek: {
    totalBookings: number
    completedJobs: number
    totalRevenue: number
    averageRating: number
    newCustomers: number
    repeatCustomers: number
    completionRate: number
  }
  thisMonth: {
    totalBookings: number
    completedJobs: number
    totalRevenue: number
    averageJobTime: string
    customerSatisfaction: number
    growthRate: number
    topServices: {
      serviceType: ServiceType
      count: number
      revenue: number
    }[]
  }
  thisYear: {
    totalBookings: number
    totalRevenue: number
    averageMonthlyGrowth: number
    bestMonth: string
    peakSeason: string
  }
}

export interface BusinessReport {
  period: {
    type: 'day' | 'week' | 'month' | 'quarter' | 'year'
    year: number
    month?: number
    quarter?: number
    week?: number
    day?: number
    startDate: string
    endDate: string
    label: string
  }
  overview: {
    totalBookings: number
    completedBookings: number
    cancelledBookings: number
    pendingBookings: number
    completionRate: number
    cancellationRate: number
    totalRevenue: number
    averageJobValue: number
    averageRating: number
    customerSatisfaction: number
    responseTime: string
    jobDuration: string
    profitMargin: number
  }
  comparisons: {
    previousPeriod: {
      bookingsGrowth: number
      revenueGrowth: number
      ratingChange: number
      customerGrowth: number
    }
    yearOverYear?: {
      bookingsGrowth: number
      revenueGrowth: number
      seasonalTrends: any
    }
  }
  serviceBreakdown: ServiceBreakdown[]
  paymentAnalysis: PaymentAnalysis
  teamPerformance: TeamPerformanceReport[]
  customerAnalysis: CustomerAnalysis
  timeAnalysis: TimeAnalysis
  geographicAnalysis: GeographicAnalysis
  inventoryAnalysis?: InventoryAnalysis
  qualityMetrics: QualityMetrics
  financialMetrics: FinancialMetrics
}

export interface ServiceBreakdown {
  serviceType: ServiceType
  category: string
  bookings: number
  percentage: number
  revenue: number
  averageValue: number
  averageRating: number
  completionRate: number
  averageDuration: string
  popularServices: {
    name: string
    name_ta: string
    count: number
    revenue: number
    rating: number
  }[]
  trends: {
    period: string
    bookings: number
    revenue: number
  }[]
  customerSegments: {
    segment: string
    percentage: number
    averageValue: number
  }[]
}

export interface PaymentAnalysis {
  totalEarnings: number
  cashReceived: number
  onlineReceived: number
  pendingPayments: number
  overduePayments: number
  refundedAmount: number
  collectionRate: number
  averageCollectionTime: string
  paymentMethodBreakdown: {
    method: PaymentMethod
    amount: number
    percentage: number
    transactionCount: number
  }[]
  dailyCollections: {
    date: string
    amount: number
    count: number
  }[]
  outstandingAmount: number
  badDebts: number
}

export interface TeamPerformanceReport {
  teamId: string
  teamName: string
  members: TeamMember[]
  metrics: {
    jobsCompleted: number
    revenue: number
    averageRating: number
    completionRate: number
    onTimePercentage: number
    averageJobTime: string
    customerRetention: number
    efficiency: number
    productivity: number
    qualityScore: number
  }
  comparisons: {
    previousPeriod: {
      jobsChange: number
      revenueChange: number
      ratingChange: number
      efficiencyChange: number
    }
    teamRanking: number
    industryBenchmark: number
  }
  issues: {
    customerComplaints: number
    qualityIssues: number
    safetyViolations: number
    disciplinaryActions: number
  }
  achievements: {
    badges: string[]
    milestones: string[]
    awards: string[]
  }
  recommendations: string[]
}

export interface CustomerAnalysis {
  totalCustomers: number
  newCustomers: number
  returningCustomers: number
  activeCustomers: number
  inactiveCustomers: number
  customerRetentionRate: number
  churnRate: number
  averageBookingsPerCustomer: number
  averageCustomerValue: number
  customerLifetimeValue: number
  customerSegments: {
    segment: string
    count: number
    percentage: number
    averageValue: number
    retentionRate: number
  }[]
  topCustomers: {
    customerId: string
    name: string
    totalBookings: number
    totalSpent: number
    averageRating: number
    lastBooking: string
    loyaltyLevel: string
  }[]
  customerSatisfactionTrends: {
    period: string
    rating: number
    nps: number
    satisfaction: number
  }[]
  geographicDistribution: {
    area: string
    customerCount: number
    revenue: number
    averageRating: number
  }[]
}

export interface TimeAnalysis {
  peakHours: {
    hour: number
    bookings: number
    revenue: number
    label: string
  }[]
  peakDays: {
    day: string
    bookings: number
    revenue: number
    averageRating: number
  }[]
  seasonalTrends: {
    season: string
    months: string[]
    bookings: number
    revenue: number
    popularServices: string[]
  }[]
  averageResponseTime: string
  averageJobDuration: string
  timeToCompletion: string
  workingHoursAnalysis: {
    regularHours: number
    afterHours: number
    weekends: number
    holidays: number
    emergencies: number
  }
  demandForecasting: {
    nextWeek: number
    nextMonth: number
    nextQuarter: number
    confidence: number
  }
}

export interface GeographicAnalysis {
  totalAreas: number
  coveredAreas: number
  topAreas: {
    areaId: string
    areaName: string
    pincode: string
    bookings: number
    revenue: number
    averageRating: number
    customerCount: number
    marketPenetration: number
    growthRate: number
  }[]
  heatmapData: {
    lat: number
    lng: number
    intensity: number
    area: string
  }[]
  expansion: {
    suggestedAreas: {
      area: string
      potential: number
      competition: string
      demographics: any
    }[]
    marketGaps: string[]
  }
  travelAnalysis: {
    averageDistance: number
    longestDistance: number
    totalDistanceCovered: number
    fuelCost: number
    timeInTravel: string
  }
}

export interface InventoryAnalysis {
  totalProducts: number
  totalValue: number
  lowStockItems: number
  outOfStockItems: number
  overstockItems: number
  fastMovingItems: {
    productId: string
    name: string
    salesVelocity: number
    revenue: number
    profitMargin: number
  }[]
  slowMovingItems: {
    productId: string
    name: string
    daysInStock: number
    currentStock: number
    suggestedAction: string
  }[]
  categoryAnalysis: {
    category: ProductCategory
    totalValue: number
    turnoverRate: number
    profitMargin: number
    growthRate: number
  }[]
  reorderAlerts: {
    productId: string
    name: string
    currentStock: number
    reorderLevel: number
    suggestedQuantity: number
    urgency: 'low' | 'medium' | 'high' | 'critical'
  }[]
  wasteAnalysis: {
    expiredItems: number
    damagedItems: number
    totalLoss: number
    wastePercentage: number
  }
}

export interface QualityMetrics {
  overallQualityScore: number
  customerSatisfactionIndex: number
  netPromoterScore: number
  defectRate: number
  reworkRate: number
  firstTimeFixRate: number
  customerComplaintRate: number
  averageResolutionTime: string
  qualityTrends: {
    period: string
    score: number
    satisfaction: number
    complaints: number
  }[]
  serviceQuality: {
    serviceType: ServiceType
    qualityScore: number
    satisfaction: number
    commonIssues: string[]
  }[]
  teamQuality: {
    teamId: string
    teamName: string
    qualityScore: number
    customerRating: number
    complaintCount: number
  }[]
}

export interface FinancialMetrics {
  grossRevenue: number
  netRevenue: number
  totalCosts: number
  operatingCosts: number
  laborCosts: number
  materialCosts: number
  overheadCosts: number
  grossProfit: number
  netProfit: number
  profitMargin: number
  costPerJob: number
  revenuePerTeam: number
  breakdownByCategory: {
    category: string
    revenue: number
    costs: number
    profit: number
    margin: number
  }[]
  cashFlow: {
    inflow: number
    outflow: number
    netFlow: number
    projectedFlow: number
  }
  financialRatios: {
    currentRatio: number
    quickRatio: number
    profitabilityRatio: number
    efficiencyRatio: number
  }
}

// ====== WEBSOCKET EVENT TYPES ======
export interface WebSocketEvent {
  event: string
  data: any
  timestamp: string
  source?: string
  priority?: 'low' | 'normal' | 'high' | 'urgent'
  userId?: string
  sessionId?: string
}

export interface BookingStatusUpdateEvent {
  event: 'booking_status_update'
  data: {
    bookingId: string
    bookingNumber: string
    status: BookingStatus
    previousStatus: BookingStatus
    customerId: string
    teamId?: string
    message_ta: string
    message_en: string
    teamLocation?: Location
    estimatedCompletion?: string
    metadata?: Record<string, any>
  }
}

export interface TeamLocationUpdateEvent {
  event: 'team_location_update'
  data: {
    teamId: string
    teamName: string
    bookingId?: string
    location: Location
    distanceFromDestination?: string
    eta?: string
    speed?: number
    isMoving: boolean
  }
}

export interface NewBookingEvent {
  event: 'new_booking'
  data: {
    booking: Booking
    customer: User
    priority: BookingPriority
    suggestedTeams: {
      teamId: string
      teamName: string
      distance: string
      eta: string
      currentLoad: number
      rating: number
    }[]
    autoAssign: boolean
  }
}

export interface PaymentStatusEvent {
  event: 'payment_status_update'
  data: {
    bookingId: string
    paymentId: string
    status: PaymentStatus
    amount: number
    method: PaymentMethod
    customerId: string
    teamId?: string
  }
}

export interface EmergencyAlertEvent {
  event: 'emergency_alert'
  data: {
    booking: Booking
    customer: User
    urgencyLevel: 'high' | 'critical'
    estimatedResponseTime: string
    nearestTeams: {
      teamId: string
      distance: string
      eta: string
    }[]
    escalationRequired: boolean
  }
}

export interface SystemNotificationEvent {
  event: 'system_notification'
  data: {
    type: 'maintenance' | 'update' | 'alert' | 'info'
    title: string
    message: string
    actionRequired: boolean
    url?: string
    expiresAt?: string
  }
}

// ====== API RESPONSE TYPES ======
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message: string
  message_ta?: string
  errors?: ApiError[]
  warnings?: string[]
  metadata?: {
    timestamp: string
    version: string
    requestId: string
    processingTime?: number
  }
}

export interface ApiError {
  code: string
  field?: string
  message: string
  message_ta?: string
  details?: any
  suggestion?: string
}

export interface PaginationParams {
  page?: number
  limit?: number
  offset?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  search?: string
  filters?: Record<string, any>
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    currentPage: number
    totalPages: number
    limit: number
    totalItems: number
    hasNextPage: boolean
    hasPreviousPage: boolean
    nextPage?: number
    previousPage?: number
  }
  summary?: {
    total: number
    filtered: number
    [key: string]: any
  }
}

// ====== FILTER & SEARCH TYPES ======
export interface BookingFilter {
  status?: BookingStatus[]
  serviceType?: ServiceType[]
  priority?: BookingPriority[]
  teamId?: string
  customerId?: string
  dateFrom?: string
  dateTo?: string
  scheduledFrom?: string
  scheduledTo?: string
  rating?: number
  paymentStatus?: PaymentStatus[]
  location?: string
  search?: string
  sortBy?: 'createdAt' | 'scheduledTime' | 'status' | 'rating' | 'totalAmount'
  sortOrder?: 'asc' | 'desc'
}

export interface ProductFilter {
  category?: ProductCategory[]
  brand?: string[]
  priceMin?: number
  priceMax?: number
  inStock?: boolean
  isActive?: boolean
  isFeatured?: boolean
  rating?: number
  search?: string
  sortBy?: 'name' | 'price' | 'rating' | 'popularity' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
  tags?: string[]
}

export interface TeamFilter {
  status?: TeamStatus[]
  skills?: ServiceType[]
  location?: string
  availability?: boolean
  rating?: number
  experienceLevel?: 'junior' | 'senior' | 'expert'
  search?: string
  sortBy?: 'name' | 'rating' | 'completedJobs' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}

export interface CustomerFilter {
  status?: 'active' | 'inactive'
  registrationDateFrom?: string
  registrationDateTo?: string
  totalBookings?: number
  averageRating?: number
  location?: string
  search?: string
  sortBy?: 'name' | 'totalBookings' | 'lastBooking' | 'totalSpent'
  sortOrder?: 'asc' | 'desc'
}

// ====== EXPORT & REPORT TYPES ======
export interface ExportReportRequest {
  reportType: 'bookings' | 'customers' | 'teams' | 'financial' | 'inventory' | 'comprehensive'
  period: BusinessReport['period']
  format: 'pdf' | 'excel' | 'csv' | 'json'
  language: Language
  sections: string[]
  filters?: Record<string, any>
  includeCharts?: boolean
  includeImages?: boolean
  customFields?: string[]
  email?: string
  compression?: 'none' | 'zip'
}

export interface ExportReportResponse {
  id: string
  reportType: string
  format: string
  language: Language
  status: 'queued' | 'generating' | 'completed' | 'failed'
  progress?: number
  fileSize?: number
  downloadUrl?: string
  expiresAt?: string
  estimatedTime?: string
  error?: string
}

// ====== FORM VALIDATION TYPES ======
export interface ServiceSelectionForm {
  serviceType: ServiceType
  serviceId?: string
  subcategory?: string
  priority: BookingPriority
  urgentReason?: string
}

export interface ProblemDescriptionForm {
  title: string
  description: string
  photos: File[]
  videoFile?: File
  quickIssue?: string
  additionalRequirements?: string
  budgetRange?: {
    min: number
    max: number
  }
  timePreference?: string
}

export interface ContactInfoForm {
  name: string
  phone: string
  alternatePhone?: string
  email?: string
  whatsappNumber?: string
  address: string
  landmark?: string
  pincode?: string
  location?: Location
  accessInstructions?: string
  specialInstructions?: string
}

export interface ScheduleSelectionForm {
  scheduledDate: string
  scheduledTime: string
  timeSlot?: string
  isFlexible: boolean
  preferredTimeRange?: {
    start: string
    end: string
  }
  emergencyBooking?: boolean
  preferredTeam?: string
}

// ====== UI STATE TYPES ======
export interface UIState {
  theme: 'light' | 'dark' | 'system'
  language: Language
  isLoading: boolean
  isOffline: boolean
  currentScreen: string
  screenHistory: string[]
  notifications: Notification[]
  errors: ApiError[]
  modals: {
    [key: string]: {
      isOpen: boolean
      data?: any
    }
  }
  sidebar: {
    isOpen: boolean
    collapsed: boolean
  }
  filters: {
    [key: string]: any
  }
  preferences: UserPreferences
}

export interface NavigationState {
  currentPath: string
  previousPath?: string
  breadcrumbs: {
    label: string
    path: string
  }[]
  canGoBack: boolean
  isNavigating: boolean
}

// ====== STORE TYPES (ZUSTAND) ======
export interface AuthStore {
  // State
  user: User | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isAdmin: boolean
  isTeamMember: boolean
  language: Language
  location: Location | null
  permissions: string[]
  deviceInfo: {
    id: string
    type: 'mobile' | 'desktop' | 'tablet'
    os: string
    browser: string
  } | null

  // Actions
  login: (credentials: LoginRequest) => Promise<AuthResponse>
  register: (data: RegisterRequest) => Promise<AuthResponse>
  logout: () => Promise<void>
  refreshTokens: () => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<User>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
  setLanguage: (language: Language) => void
  updateLocation: (location: Location) => void
  setDeviceInfo: (info: AuthStore['deviceInfo']) => void
  
  // Computed
  hasPermission: (permission: string) => boolean
  isSessionExpired: () => boolean
}

export interface BookingStore {
  // State
  currentBooking: Partial<CreateBookingRequest>
  myBookings: Booking[]
  selectedBooking: Booking | null
  bookingHistory: Booking[]
  isSubmitting: boolean
  currentStep: number
  filters: BookingFilter
  
  // Actions
  updateBookingStep: (data: Partial<CreateBookingRequest>) => void
  setCurrentStep: (step: number) => void
  submitBooking: () => Promise<Booking>
  fetchMyBookings: (refresh?: boolean) => Promise<void>
  fetchBookingDetails: (id: string) => Promise<Booking>
  updateBooking: (id: string, data: UpdateBookingRequest) => Promise<Booking>
  cancelBooking: (id: string, data: CancelBookingRequest) => Promise<void>
  rescheduleBooking: (id: string, data: RescheduleBookingRequest) => Promise<void>
  submitFeedback: (id: string, feedback: SubmitFeedbackRequest) => Promise<void>
  clearCurrentBooking: () => void
  setFilters: (filters: BookingFilter) => void
  
  // Computed
  canSubmitBooking: () => boolean
  getTotalSteps: () => number
  isStepComplete: (step: number) => boolean
}

export interface AdminStore {
  // State
  dashboardMetrics: DashboardMetrics | null
  bookings: Booking[]
  urgentBookings: Booking[]
  teams: Team[]
  customers: User[]
  selectedBooking: Booking | null
  selectedTeam: Team | null
  filters: {
    bookings: BookingFilter
    teams: TeamFilter
    customers: CustomerFilter
  }
  isLoading: {
    dashboard: boolean
    bookings: boolean
    teams: boolean
    customers: boolean
  }
  
  // Actions
  fetchDashboard: () => Promise<DashboardMetrics>
  fetchBookings: (filter?: BookingFilter) => Promise<void>
  fetchUrgentBookings: () => Promise<void>
  assignTeam: (bookingId: string, teamId: string, notes?: string) => Promise<void>
  updateBookingStatus: (id: string, data: UpdateBookingStatusRequest) => Promise<void>
  fetchTeams: () => Promise<void>
  updateTeamStatus: (teamId: string, data: UpdateTeamStatusRequest) => Promise<void>
  createTeam: (data: CreateTeamRequest) => Promise<Team>
  fetchCustomers: (filter?: CustomerFilter) => Promise<void>
  generateReport: (request: ExportReportRequest) => Promise<ExportReportResponse>
  setBookingFilters: (filters: BookingFilter) => void
  setTeamFilters: (filters: TeamFilter) => void
  setCustomerFilters: (filters: CustomerFilter) => void
  
  // Real-time updates
  handleWebSocketEvent: (event: WebSocketEvent) => void
}

export interface ProductStore {
  // State
  products: Product[]
  categories: ProductCategoryInterface[]
  selectedCategory: ProductCategoryInterface | null
  selectedProduct: Product | null
  cart: CartItem[]
  wishlist: string[]
  inventory: Product[] // Admin only
  filters: ProductFilter
  
  // Actions
  fetchProducts: (filter?: ProductFilter) => Promise<void>
  fetchCategories: () => Promise<void>
  fetchProductDetails: (id: string) => Promise<Product>
  searchProducts: (query: string) => Promise<Product[]>
  addToCart: (productId: string, quantity: number) => void
  updateCartItem: (productId: string, quantity: number) => void
  removeFromCart: (productId: string) => void
  clearCart: () => void
  addToWishlist: (productId: string) => void
  removeFromWishlist: (productId: string) => void
  // Admin actions
  createProduct: (data: CreateProductRequest) => Promise<Product>
  updateProduct: (id: string, data: Partial<Product>) => Promise<Product>
  updateInventory: (productId: string, data: UpdateInventoryRequest) => Promise<void>
  setFilters: (filters: ProductFilter) => void
  
  // Computed
  getCartTotal: () => number
  getCartItemCount: () => number
  isInCart: (productId: string) => boolean
  isInWishlist: (productId: string) => boolean
}

// ====== SERVICE LAYER TYPES ======
export interface BookingServiceOptions {
  includeTeam?: boolean
  includeCustomer?: boolean
  includePayments?: boolean
  includeFeedback?: boolean
  includeStatusHistory?: boolean
  includePartsUsed?: boolean
}

export interface TeamServiceOptions {
  includeMembers?: boolean
  includeCurrentJob?: boolean
  includePerformanceMetrics?: boolean
  includeAvailability?: boolean
}

export interface ProductServiceOptions {
  includeStockMovements?: boolean
  includeSupplier?: boolean
  includeSalesData?: boolean
  includeReviews?: boolean
}

// ====== MIDDLEWARE TYPES ======
export interface AuthMiddleware {
  requireAuth: boolean
  requiredRole?: UserRole
  requiredPermissions?: string[]
  allowGuest?: boolean
}

export interface ValidationMiddleware {
  schema: any
  validateBody?: boolean
  validateQuery?: boolean
  validateParams?: boolean
}

export interface RateLimitMiddleware {
  windowMs: number
  maxRequests: number
  message?: string
  skipSuccessfulRequests?: boolean
}

// Type aliases for common database operations
export type NewUser = Omit<User, 'id' | 'createdAt' | 'updatedAt'>
export type NewTeam = Omit<Team, 'id' | 'createdAt' | 'updatedAt' | 'performance' | 'statistics' | 'availability'>
export type NewTeamMember = Omit<TeamMember, 'id' | 'createdAt' | 'updatedAt'>
export type NewBooking = Omit<Booking, 'id' | 'bookingNumber' | 'createdAt' | 'updatedAt' | 'statusHistory' | 'timeline'>
export type NewProduct = Omit<Product, 'id' | 'sku' | 'createdAt' | 'updatedAt' | 'salesData'>
export type NewPayment = Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>
export type NewNotification = Omit<Notification, 'id' | 'createdAt' | 'updatedAt'>