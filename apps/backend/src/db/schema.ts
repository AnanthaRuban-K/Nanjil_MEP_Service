import { pgTable, uuid, varchar, text, timestamp, decimal, integer, boolean, jsonb, pgEnum, primaryKey, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const userRoleEnum = pgEnum('user_role', ['customer', 'admin', 'team_member']);
export const serviceTypeEnum = pgEnum('service_type', ['electrical', 'plumbing', 'emergency']);
export const bookingStatusEnum = pgEnum('booking_status', ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled']);
export const priorityEnum = pgEnum('priority', ['low', 'normal', 'high', 'emergency']);
export const teamStatusEnum = pgEnum('team_status', ['available', 'busy', 'off-duty']);
export const paymentMethodEnum = pgEnum('payment_method', ['cash', 'upi', 'card', 'bank_transfer']);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'paid', 'failed', 'refunded']);
export const notificationTypeEnum = pgEnum('notification_type', ['sms', 'whatsapp', 'email', 'push']);
export const languageEnum = pgEnum('language', ['ta', 'en']);
export const stockStatusEnum = pgEnum('stock_status', ['out_of_stock', 'low', 'adequate', 'overstocked']);

// Users table
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  clerkUserId: varchar('clerk_user_id', { length: 255 }).unique(),
  name: varchar('name', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 15 }).notNull().unique(),
  email: varchar('email', { length: 255 }),
  address: text('address'),
  role: userRoleEnum('role').default('customer').notNull(),
  language: languageEnum('language').default('ta').notNull(),
  location: jsonb('location').$type<{ lat: number; lng: number }>(),
  isVerified: boolean('is_verified').default(false),
  isActive: boolean('is_active').default(true),
  totalBookings: integer('total_bookings').default(0),
  completedBookings: integer('completed_bookings').default(0),
  averageRating: decimal('average_rating', { precision: 3, scale: 2 }).default('0'),
  joinedDate: timestamp('joined_date').defaultNow().notNull(),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  phoneIdx: index('users_phone_idx').on(table.phone),
  emailIdx: index('users_email_idx').on(table.email),
  roleIdx: index('users_role_idx').on(table.role),
}));

// Teams table
export const teams = pgTable('teams', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  status: teamStatusEnum('status').default('available').notNull(),
  skills: jsonb('skills').$type<string[]>().notNull(),
  currentLocation: jsonb('current_location').$type<{ 
    lat: number; 
    lng: number; 
    address?: string; 
    lastUpdated: string; 
  }>(),
  vehicle: jsonb('vehicle').$type<{
    type: string;
    number: string;
    fuelStatus?: string;
    hasToolkit?: boolean;
  }>(),
  workingHours: jsonb('working_hours').$type<{
    start: string;
    end: string;
  }>().default({ start: '09:00', end: '21:00' }),
  serviceAreas: jsonb('service_areas').$type<string[]>(),
  isEmergencyAvailable: boolean('is_emergency_available').default(false),
  currentJobId: uuid('current_job_id'),
  estimatedFree: timestamp('estimated_free'),
  totalJobs: integer('total_jobs').default(0),
  completedJobs: integer('completed_jobs').default(0),
  averageRating: decimal('average_rating', { precision: 3, scale: 2 }).default('0'),
  averageJobTime: decimal('average_job_time', { precision: 4, scale: 2 }).default('0'), // in hours
  onTimePercentage: decimal('on_time_percentage', { precision: 5, scale: 2 }).default('0'),
  isActive: boolean('is_active').default(true),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  statusIdx: index('teams_status_idx').on(table.status),
  skillsIdx: index('teams_skills_idx').on(table.skills),
}));

// Team members table
export const teamMembers = pgTable('team_members', {
  id: uuid('id').defaultRandom().primaryKey(),
  teamId: uuid('team_id').references(() => teams.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  role: varchar('role', { length: 100 }).notNull(),
  phone: varchar('phone', { length: 15 }).notNull(),
  experience: varchar('experience', { length: 50 }),
  aadharNumber: varchar('aadhar_number', { length: 20 }),
  isLead: boolean('is_lead').default(false),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  teamIdx: index('team_members_team_idx').on(table.teamId),
  phoneIdx: index('team_members_phone_idx').on(table.phone),
}));

// Service categories table
export const serviceCategories = pgTable('service_categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  nameEn: varchar('name_en', { length: 255 }).notNull(),
  nameTa: varchar('name_ta', { length: 255 }).notNull(),
  category: serviceTypeEnum('category').notNull(),
  descriptionEn: text('description_en'),
  descriptionTa: text('description_ta'),
  basePrice: decimal('base_price', { precision: 10, scale: 2 }).notNull(),
  estimatedTime: varchar('estimated_time', { length: 50 }),
  isEmergency: boolean('is_emergency').default(false),
  isActive: boolean('is_active').default(true),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  categoryIdx: index('service_categories_category_idx').on(table.category),
  activeIdx: index('service_categories_active_idx').on(table.isActive),
}));

// Bookings table
export const bookings = pgTable('bookings', {
  id: uuid('id').defaultRandom().primaryKey(),
  bookingNumber: varchar('booking_number', { length: 20 }).notNull().unique(),
  customerId: uuid('customer_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  serviceType: serviceTypeEnum('service_type').notNull(),
  serviceCategoryId: uuid('service_category_id').references(() => serviceCategories.id),
  status: bookingStatusEnum('status').default('pending').notNull(),
  priority: priorityEnum('priority').default('normal').notNull(),
  description: text('description').notNull(),
  scheduledTime: timestamp('scheduled_time').notNull(),
  estimatedArrival: timestamp('estimated_arrival'),
  estimatedDuration: varchar('estimated_duration', { length: 50 }),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  cancelledAt: timestamp('cancelled_at'),
  cancelReason: text('cancel_reason'),
  contactInfo: jsonb('contact_info').$type<{
    name: string;
    phone: string;
    address: string;
  }>().notNull(),
  location: jsonb('location').$type<{ lat: number; lng: number }>(),
  photos: jsonb('photos').$type<string[]>().default([]),
  assignedTeamId: uuid('assigned_team_id').references(() => teams.id),
  adminNotes: text('admin_notes'),
  canCancel: boolean('can_cancel').default(true),
  canReschedule: boolean('can_reschedule').default(true),
  estimatedCompletion: timestamp('estimated_completion'),
  actualDuration: decimal('actual_duration', { precision: 4, scale: 2 }), // in hours
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  customerIdx: index('bookings_customer_idx').on(table.customerId),
  statusIdx: index('bookings_status_idx').on(table.status),
  serviceTypeIdx: index('bookings_service_type_idx').on(table.serviceType),
  priorityIdx: index('bookings_priority_idx').on(table.priority),
  teamIdx: index('bookings_team_idx').on(table.assignedTeamId),
  scheduledIdx: index('bookings_scheduled_idx').on(table.scheduledTime),
  bookingNumberIdx: index('bookings_number_idx').on(table.bookingNumber),
}));

// Booking status history table
export const bookingStatusHistory = pgTable('booking_status_history', {
  id: uuid('id').defaultRandom().primaryKey(),
  bookingId: uuid('booking_id').references(() => bookings.id, { onDelete: 'cascade' }).notNull(),
  status: bookingStatusEnum('status').notNull(),
  previousStatus: bookingStatusEnum('previous_status'),
  note: text('note'),
  changedBy: uuid('changed_by').references(() => users.id),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  metadata: jsonb('metadata').$type<Record<string, any>>(),
}, (table) => ({
  bookingIdx: index('booking_status_history_booking_idx').on(table.bookingId),
  timestampIdx: index('booking_status_history_timestamp_idx').on(table.timestamp),
}));

// Products table
export const products = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  sku: varchar('sku', { length: 100 }).unique(),
  nameEn: varchar('name_en', { length: 255 }).notNull(),
  nameTa: varchar('name_ta', { length: 255 }).notNull(),
  category: serviceTypeEnum('category').notNull(),
  subcategory: varchar('subcategory', { length: 100 }),
  descriptionEn: text('description_en'),
  descriptionTa: text('description_ta'),
  specifications: jsonb('specifications').$type<Record<string, any>>(),
  costPrice: decimal('cost_price', { precision: 10, scale: 2 }).notNull(),
  sellingPrice: decimal('selling_price', { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal('original_price', { precision: 10, scale: 2 }),
  discountPercentage: decimal('discount_percentage', { precision: 5, scale: 2 }).default('0'),
  currentStock: integer('current_stock').default(0),
  minStockLevel: integer('min_stock_level').default(5),
  maxStockLevel: integer('max_stock_level').default(100),
  reorderPoint: integer('reorder_point').default(10),
  stockStatus: stockStatusEnum('stock_status').default('adequate'),
  images: jsonb('images').$type<string[]>().default([]),
  averageRating: decimal('average_rating', { precision: 3, scale: 2 }).default('0'),
  totalReviews: integer('total_reviews').default(0),
  totalSales: integer('total_sales').default(0),
  isActive: boolean('is_active').default(true),
  isAvailable: boolean('is_available').default(true),
  deliveryTime: varchar('delivery_time', { length: 100 }),
  warranty: varchar('warranty', { length: 100 }),
  supplier: jsonb('supplier').$type<{
    name: string;
    phone: string;
    email?: string;
    lastOrderDate?: string;
  }>(),
  lastRestocked: timestamp('last_restocked'),
  expiryDate: timestamp('expiry_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  skuIdx: index('products_sku_idx').on(table.sku),
  categoryIdx: index('products_category_idx').on(table.category),
  stockStatusIdx: index('products_stock_status_idx').on(table.stockStatus),
  activeIdx: index('products_active_idx').on(table.isActive),
}));

// Stock movements table
export const stockMovements = pgTable('stock_movements', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  movementType: varchar('movement_type', { length: 20 }).notNull(), // 'in', 'out', 'adjustment'
  quantity: integer('quantity').notNull(),
  previousStock: integer('previous_stock').notNull(),
  newStock: integer('new_stock').notNull(),
  reason: varchar('reason', { length: 100 }).notNull(), // 'purchase', 'sale', 'adjustment', 'damage'
  referenceId: uuid('reference_id'), // booking_id or purchase_order_id
  referenceType: varchar('reference_type', { length: 50 }), // 'booking', 'purchase', 'adjustment'
  notes: text('notes'),
  costPrice: decimal('cost_price', { precision: 10, scale: 2 }),
  totalCost: decimal('total_cost', { precision: 10, scale: 2 }),
  performedBy: uuid('performed_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  productIdx: index('stock_movements_product_idx').on(table.productId),
  typeIdx: index('stock_movements_type_idx').on(table.movementType),
  createdIdx: index('stock_movements_created_idx').on(table.createdAt),
}));

// Booking parts used table
export const bookingPartsUsed = pgTable('booking_parts_used', {
  id: uuid('id').defaultRandom().primaryKey(),
  bookingId: uuid('booking_id').references(() => bookings.id, { onDelete: 'cascade' }).notNull(),
  productId: uuid('product_id').references(() => products.id).notNull(),
  quantity: integer('quantity').notNull(),
  unitPrice: decimal('unit_price', { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal('total_price', { precision: 10, scale: 2 }).notNull(),
  costPrice: decimal('cost_price', { precision: 10, scale: 2 }),
  addedAt: timestamp('added_at').defaultNow().notNull(),
}, (table) => ({
  bookingIdx: index('booking_parts_booking_idx').on(table.bookingId),
  productIdx: index('booking_parts_product_idx').on(table.productId),
}));

// Payments table
export const payments = pgTable('payments', {
  id: uuid('id').defaultRandom().primaryKey(),
  bookingId: uuid('booking_id').references(() => bookings.id, { onDelete: 'cascade' }).notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  method: paymentMethodEnum('method').notNull(),
  status: paymentStatusEnum('status').default('pending').notNull(),
  transactionId: varchar('transaction_id', { length: 100 }),
  gatewayResponse: jsonb('gateway_response').$type<Record<string, any>>(),
  paidAt: timestamp('paid_at'),
  refundedAt: timestamp('refunded_at'),
  refundAmount: decimal('refund_amount', { precision: 10, scale: 2 }).default('0'),
  notes: text('notes'),
  receivedBy: uuid('received_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  bookingIdx: index('payments_booking_idx').on(table.bookingId),
  statusIdx: index('payments_status_idx').on(table.status),
  methodIdx: index('payments_method_idx').on(table.method),
}));

// Feedback table
export const feedback = pgTable('feedback', {
  id: uuid('id').defaultRandom().primaryKey(),
  bookingId: uuid('booking_id').references(() => bookings.id, { onDelete: 'cascade' }).notNull(),
  customerId: uuid('customer_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  teamId: uuid('team_id').references(() => teams.id).notNull(),
  rating: integer('rating').notNull(), // 1-5
  review: text('review'),
  serviceAspects: jsonb('service_aspects').$type<{
    punctuality: number;
    quality: number;
    politeness: number;
    pricing: number;
  }>(),
  photos: jsonb('photos').$type<string[]>().default([]),
  wouldRecommend: boolean('would_recommend'),
  isPublic: boolean('is_public').default(true),
  adminResponse: text('admin_response'),
  respondedAt: timestamp('responded_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  bookingIdx: index('feedback_booking_idx').on(table.bookingId),
  customerIdx: index('feedback_customer_idx').on(table.customerId),
  teamIdx: index('feedback_team_idx').on(table.teamId),
  ratingIdx: index('feedback_rating_idx').on(table.rating),
}));

// Service areas table
export const serviceAreas = pgTable('service_areas', {
  id: uuid('id').defaultRandom().primaryKey(),
  nameEn: varchar('name_en', { length: 255 }).notNull(),
  nameTa: varchar('name_ta', { length: 255 }).notNull(),
  pincode: varchar('pincode', { length: 10 }).notNull(),
  estimatedArrival: varchar('estimated_arrival', { length: 50 }),
  serviceCharge: decimal('service_charge', { precision: 10, scale: 2 }).default('0'),
  isActive: boolean('is_active').default(true),
  coordinates: jsonb('coordinates').$type<{
    lat: number;
    lng: number;
    radius?: number;
  }>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  pincodeIdx: index('service_areas_pincode_idx').on(table.pincode),
  activeIdx: index('service_areas_active_idx').on(table.isActive),
}));

// Notifications table
export const notifications = pgTable('notifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  type: notificationTypeEnum('type').notNull(),
  recipient: varchar('recipient', { length: 255 }).notNull(), // phone/email
  subject: varchar('subject', { length: 255 }),
  message: text('message').notNull(),
  templateId: varchar('template_id', { length: 100 }),
  templateData: jsonb('template_data').$type<Record<string, any>>(),
  status: varchar('status', { length: 20 }).default('pending').notNull(), // pending, sent, delivered, failed
  gatewayId: varchar('gateway_id', { length: 100 }),
  gatewayResponse: jsonb('gateway_response').$type<Record<string, any>>(),
  sentAt: timestamp('sent_at'),
  deliveredAt: timestamp('delivered_at'),
  failedAt: timestamp('failed_at'),
  errorMessage: text('error_message'),
  retryCount: integer('retry_count').default(0),
  bookingId: uuid('booking_id').references(() => bookings.id),
  userId: uuid('user_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  typeIdx: index('notifications_type_idx').on(table.type),
  statusIdx: index('notifications_status_idx').on(table.status),
  recipientIdx: index('notifications_recipient_idx').on(table.recipient),
  bookingIdx: index('notifications_booking_idx').on(table.bookingId),
}));

// Cart items table (for phone orders)
export const cartItems = pgTable('cart_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  customerId: uuid('customer_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  quantity: integer('quantity').notNull(),
  unitPrice: decimal('unit_price', { precision: 10, scale: 2 }).notNull(),
  subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
  note: text('note'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  customerIdx: index('cart_items_customer_idx').on(table.customerId),
  productIdx: index('cart_items_product_idx').on(table.productId),
}));

// System settings table
export const systemSettings = pgTable('system_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  key: varchar('key', { length: 100 }).unique().notNull(),
  value: text('value').notNull(),
  valueType: varchar('value_type', { length: 20 }).default('string'), // string, number, boolean, json
  description: text('description'),
  category: varchar('category', { length: 50 }).default('general'),
  isPublic: boolean('is_public').default(false),
  updatedBy: uuid('updated_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  keyIdx: index('system_settings_key_idx').on(table.key),
  categoryIdx: index('system_settings_category_idx').on(table.category),
}));

// File uploads table
export const fileUploads = pgTable('file_uploads', {
  id: uuid('id').defaultRandom().primaryKey(),
  filename: varchar('filename', { length: 255 }).notNull(),
  originalName: varchar('original_name', { length: 255 }).notNull(),
  mimeType: varchar('mime_type', { length: 100 }).notNull(),
  size: integer('size').notNull(),
  url: text('url').notNull(),
  uploadedBy: uuid('uploaded_by').references(() => users.id),
  entityType: varchar('entity_type', { length: 50 }), // booking, product, feedback
  entityId: uuid('entity_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  entityIdx: index('file_uploads_entity_idx').on(table.entityType, table.entityId),
  uploadedByIdx: index('file_uploads_uploaded_by_idx').on(table.uploadedBy),
}));

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  bookings: many(bookings),
  payments: many(payments),
  feedback: many(feedback),
  cartItems: many(cartItems),
  notifications: many(notifications),
}));

export const teamsRelations = relations(teams, ({ many, one }) => ({
  members: many(teamMembers),
  bookings: many(bookings),
  feedback: many(feedback),
  currentJob: one(bookings, {
    fields: [teams.currentJobId],
    references: [bookings.id],
  }),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
}));

export const serviceCategoriesRelations = relations(serviceCategories, ({ many }) => ({
  bookings: many(bookings),
}));

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  customer: one(users, {
    fields: [bookings.customerId],
    references: [users.id],
  }),
  assignedTeam: one(teams, {
    fields: [bookings.assignedTeamId],
    references: [teams.id],
  }),
  serviceCategory: one(serviceCategories, {
    fields: [bookings.serviceCategoryId],
    references: [serviceCategories.id],
  }),
  statusHistory: many(bookingStatusHistory),
  partsUsed: many(bookingPartsUsed),
  payments: many(payments),
  feedback: many(feedback),
  notifications: many(notifications),
}));

export const bookingStatusHistoryRelations = relations(bookingStatusHistory, ({ one }) => ({
  booking: one(bookings, {
    fields: [bookingStatusHistory.bookingId],
    references: [bookings.id],
  }),
  changedBy: one(users, {
    fields: [bookingStatusHistory.changedBy],
    references: [users.id],
  }),
}));

export const productsRelations = relations(products, ({ many }) => ({
  stockMovements: many(stockMovements),
  bookingPartsUsed: many(bookingPartsUsed),
  cartItems: many(cartItems),
}));

export const stockMovementsRelations = relations(stockMovements, ({ one }) => ({
  product: one(products, {
    fields: [stockMovements.productId],
    references: [products.id],
  }),
  performedBy: one(users, {
    fields: [stockMovements.performedBy],
    references: [users.id],
  }),
}));

export const bookingPartsUsedRelations = relations(bookingPartsUsed, ({ one }) => ({
  booking: one(bookings, {
    fields: [bookingPartsUsed.bookingId],
    references: [bookings.id],
  }),
  product: one(products, {
    fields: [bookingPartsUsed.productId],
    references: [products.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  booking: one(bookings, {
    fields: [payments.bookingId],
    references: [bookings.id],
  }),
  receivedBy: one(users, {
    fields: [payments.receivedBy],
    references: [users.id],
  }),
}));

export const feedbackRelations = relations(feedback, ({ one }) => ({
  booking: one(bookings, {
    fields: [feedback.bookingId],
    references: [bookings.id],
  }),
  customer: one(users, {
    fields: [feedback.customerId],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [feedback.teamId],
    references: [teams.id],
  }),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  customer: one(users, {
    fields: [cartItems.customerId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  booking: one(bookings, {
    fields: [notifications.bookingId],
    references: [bookings.id],
  }),
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

// Type exports for TypeScript
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
export type TeamMember = typeof teamMembers.$inferSelect;
export type NewTeamMember = typeof teamMembers.$inferInsert;
export type ServiceCategory = typeof serviceCategories.$inferSelect;
export type NewServiceCategory = typeof serviceCategories.$inferInsert;
export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;
export type BookingStatusHistory = typeof bookingStatusHistory.$inferSelect;
export type NewBookingStatusHistory = typeof bookingStatusHistory.$inferInsert;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type StockMovement = typeof stockMovements.$inferSelect;
export type NewStockMovement = typeof stockMovements.$inferInsert;
export type BookingPartsUsed = typeof bookingPartsUsed.$inferSelect;
export type NewBookingPartsUsed = typeof bookingPartsUsed.$inferInsert;
export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
export type Feedback = typeof feedback.$inferSelect;
export type NewFeedback = typeof feedback.$inferInsert;
export type ServiceArea = typeof serviceAreas.$inferSelect;
export type NewServiceArea = typeof serviceAreas.$inferInsert;
export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
export type CartItem = typeof cartItems.$inferSelect;
export type NewCartItem = typeof cartItems.$inferInsert;
export type SystemSetting = typeof systemSettings.$inferSelect;
export type NewSystemSetting = typeof systemSettings.$inferInsert;
export type FileUpload = typeof fileUploads.$inferSelect;
export type NewFileUpload = typeof fileUploads.$inferInsert;