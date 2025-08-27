-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enums
CREATE TYPE "user_role" AS ENUM ('customer', 'admin', 'technician');
CREATE TYPE "language" AS ENUM ('ta', 'en');
CREATE TYPE "service_category" AS ENUM ('electrical', 'plumbing');
CREATE TYPE "booking_status" AS ENUM ('pending', 'confirmed', 'in-progress', 'completed', 'cancelled');
CREATE TYPE "priority" AS ENUM ('normal', 'urgent', 'emergency');
CREATE TYPE "technician_status" AS ENUM ('available', 'busy', 'off-duty');
CREATE TYPE "payment_status" AS ENUM ('pending', 'paid', 'cancelled');
CREATE TYPE "product_category" AS ENUM (
  'electrical-switches', 
  'electrical-wiring', 
  'electrical-fixtures', 
  'electrical-fans',
  'plumbing-pipes',
  'plumbing-fittings',
  'plumbing-fixtures',
  'plumbing-tools',
  'tools',
  'accessories'
);

-- Create indexes for full-text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- apps/backend/src/db/utils.ts
import { sql } from 'drizzle-orm';
import { db } from './index';

// Utility functions for common database operations

export async function getDashboardMetrics() {
  const result = await db.execute(sql`
    SELECT 
      -- Today's metrics
      COUNT(CASE WHEN DATE(created_at) = CURRENT_DATE THEN 1 END) as today_bookings,
      COUNT(CASE WHEN DATE(created_at) = CURRENT_DATE AND status = 'completed' THEN 1 END) as today_completed,
      COUNT(CASE WHEN DATE(created_at) = CURRENT_DATE AND status = 'pending' THEN 1 END) as today_pending,
      SUM(CASE WHEN DATE(created_at) = CURRENT_DATE AND status = 'completed' THEN actual_cost ELSE 0 END) as today_revenue,
      
      -- This month's metrics
      COUNT(CASE WHEN EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM CURRENT_DATE) 
                  AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE) THEN 1 END) as month_bookings,
      COUNT(CASE WHEN EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM CURRENT_DATE) 
                  AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE)
                  AND status = 'completed' THEN 1 END) as month_completed,
      SUM(CASE WHEN EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM CURRENT_DATE) 
                AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE)
                AND status = 'completed' THEN actual_cost ELSE 0 END) as month_revenue,
      
      -- Service breakdown
      COUNT(CASE WHEN service_type = 'electrical' THEN 1 END) as electrical_jobs,
      COUNT(CASE WHEN service_type = 'plumbing' THEN 1 END) as plumbing_jobs,
      COUNT(CASE WHEN priority = 'emergency' THEN 1 END) as emergency_jobs,
      
      -- Average rating
      ROUND(AVG(rating), 2) as avg_rating
    FROM bookings
    WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
  `);
  
  return result[0];
}

export async function getTechnicianPerformance() {
  const result = await db.execute(sql`
    SELECT 
      t.id,
      t.name,
      t.rating as technician_rating,
      t.total_jobs,
      t.completed_jobs,
      ROUND((t.completed_jobs::decimal / NULLIF(t.total_jobs, 0)) * 100, 2) as completion_rate,
      AVG(r.rating) as avg_customer_rating,
      COUNT(r.id) as total_reviews,
      COUNT(CASE WHEN b.created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as jobs_this_week
    FROM technicians t
    LEFT JOIN bookings b ON t.id = b.assigned_technician_id
    LEFT JOIN reviews r ON t.id = r.technician_id
    WHERE t.is_active = true
    GROUP BY t.id, t.name, t.rating, t.total_jobs, t.completed_jobs
    ORDER BY t.rating DESC, completion_rate DESC
  `);
  
  return result;
}

export async function getPopularServices() {
  const result = await db.execute(sql`
    SELECT 
      s.id,
      s.name_en,
      s.name_ta,
      s.category,
      s.sub_category,
      COUNT(b.id) as booking_count,
      AVG(b.actual_cost) as avg_cost,
      AVG(r.rating) as avg_rating,
      COUNT(r.id) as review_count
    FROM services s
    LEFT JOIN bookings b ON s.id = b.service_id
    LEFT JOIN reviews r ON b.id = r.booking_id
    WHERE s.is_active = true
    GROUP BY s.id, s.name_en, s.name_ta, s.category, s.sub_category
    HAVING COUNT(b.id) > 0
    ORDER BY booking_count DESC, avg_rating DESC
    LIMIT 10
  `);
  
  return result;
}

export async function getLowStockProducts() {
  const result = await db.execute(sql`
    SELECT 
      id,
      name_en,
      name_ta,
      category,
      stock_quantity,
      reorder_level,
      (stock_quantity - reorder_level) as stock_deficit,
      last_sold_at
    FROM products
    WHERE is_active = true 
      AND stock_quantity <= reorder_level
    ORDER BY stock_deficit ASC, last_sold_at DESC
  `);
  
  return result;
}

export async function getBookingsByDateRange(startDate: Date, endDate: Date) {
  const result = await db.execute(sql`
    SELECT 
      DATE(created_at) as booking_date,
      COUNT(*) as total_bookings,
      COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
      COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled,
      COUNT(CASE WHEN priority = 'emergency' THEN 1 END) as emergency,
      COUNT(CASE WHEN service_type = 'electrical' THEN 1 END) as electrical,
      COUNT(CASE WHEN service_type = 'plumbing' THEN 1 END) as plumbing,
      SUM(CASE WHEN status = 'completed' THEN actual_cost ELSE 0 END) as daily_revenue
    FROM bookings
    WHERE DATE(created_at) BETWEEN ${startDate} AND ${endDate}
    GROUP BY DATE(created_at)
    ORDER BY booking_date DESC
  `);
  
  return result;
}

// Search utilities
export async function searchBookings(query: string, filters?: {
  status?: string;
  serviceType?: string;
  priority?: string;
  technicianId?: string;
}) {
  let whereConditions = [];
  const params: any[] = [`%${query}%`];

  // Add search condition
  whereConditions.push(`(
    title ILIKE $1 OR 
    description ILIKE $1 OR 
    contact_info->>'name' ILIKE $1 OR
    contact_info->>'phone' ILIKE $1
  )`);

  // Add filters
  if (filters?.status) {
    whereConditions.push(`status = $${params.length + 1}`);
    params.push(filters.status);
  }

  if (filters?.serviceType) {
    whereConditions.push(`service_type = $${params.length + 1}`);
    params.push(filters.serviceType);
  }

  if (filters?.priority) {
    whereConditions.push(`priority = $${params.length + 1}`);
    params.push(filters.priority);
  }

  if (filters?.technicianId) {
    whereConditions.push(`assigned_technician_id = $${params.length + 1}`);
    params.push(filters.technicianId);
  }

  const whereClause = whereConditions.join(' AND ');

  const result = await db.execute(sql.raw(`
    SELECT 
      b.*,
      u.name as customer_name,
      u.phone as customer_phone,
      t.name as technician_name,
      s.name_en as service_name_en,
      s.name_ta as service_name_ta
    FROM bookings b
    LEFT JOIN users u ON b.customer_id = u.id
    LEFT JOIN technicians t ON b.assigned_technician_id = t.id
    LEFT JOIN services s ON b.service_id = s.id
    WHERE ${whereClause}
    ORDER BY 
      CASE WHEN b.priority = 'emergency' THEN 1
           WHEN b.priority = 'urgent' THEN 2
           ELSE 3 END,
      b.created_at DESC
    LIMIT 50
  `, params));
  
  return result;
}

// apps/backend/src/db/queries.ts
import { eq, and, or, desc, asc, sql, like, gte, lte, inArray } from 'drizzle-orm';
import { db } from './index';
import { 
  bookings, 
  users, 
  technicians, 
  services, 
  products, 
  reviews,
  bookingEvents,
  inventoryTransactions,
  notifications
} from './schema';

// Booking queries
export const bookingQueries = {
  // Get booking with all related data
  async getBookingById(bookingId: string) {
    return await db
      .select({
        booking: bookings,
        customer: {
          id: users.id,
          name: users.name,
          phone: users.phone,
          email: users.email,
          language: users.language
        },
        technician: {
          id: technicians.id,
          name: technicians.name,
          phone: technicians.phone,
          rating: technicians.rating,
          currentLocation: technicians.currentLocation
        },
        service: {
          id: services.id,
          nameEn: services.nameEn,
          nameTa: services.nameTa,
          category: services.category,
          basePrice: services.basePrice
        }
      })
      .from(bookings)
      .leftJoin(users, eq(bookings.customerId, users.id))
      .leftJoin(technicians, eq(bookings.assignedTechnicianId, technicians.id))
      .leftJoin(services, eq(bookings.serviceId, services.id))
      .where(eq(bookings.id, bookingId))
      .limit(1);
  },

  // Get bookings with filters
  async getBookingsWithFilters(filters: {
    status?: string[];
    serviceType?: string;
    priority?: string;
    technicianId?: string;
    customerId?: string;
    dateFrom?: Date;
    dateTo?: Date;
    limit?: number;
    offset?: number;
  }) {
    let query = db
      .select({
        id: bookings.id,
        title: bookings.title,
        status: bookings.status,
        priority: bookings.priority,
        serviceType: bookings.serviceType,
        scheduledTime: bookings.scheduledTime,
        estimatedCost: bookings.estimatedCost,
        actualCost: bookings.actualCost,
        rating: bookings.rating,
        createdAt: bookings.createdAt,
        customerName: users.name,
        customerPhone: users.phone,
        technicianName: technicians.name,
        serviceNameEn: services.nameEn,
        serviceNameTa: services.nameTa,
        contactInfo: bookings.contactInfo,
        location: bookings.location
      })
      .from(bookings)
      .leftJoin(users, eq(bookings.customerId, users.id))
      .leftJoin(technicians, eq(bookings.assignedTechnicianId, technicians.id))
      .leftJoin(services, eq(bookings.serviceId, services.id));

    const conditions = [];

    if (filters.status && filters.status.length > 0) {
      conditions.push(inArray(bookings.status, filters.status as any));
    }

    if (filters.serviceType) {
      conditions.push(eq(bookings.serviceType, filters.serviceType as any));
    }

    if (filters.priority) {
      conditions.push(eq(bookings.priority, filters.priority as any));
    }

    if (filters.technicianId) {
      conditions.push(eq(bookings.assignedTechnicianId, filters.technicianId));
    }

    if (filters.customerId) {
      conditions.push(eq(bookings.customerId, filters.customerId));
    }

    if (filters.dateFrom) {
      conditions.push(gte(bookings.createdAt, filters.dateFrom));
    }

    if (filters.dateTo) {
      conditions.push(lte(bookings.createdAt, filters.dateTo));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    query = query.orderBy(
      // Priority order: emergency, urgent, normal
      sql`CASE WHEN ${bookings.priority} = 'emergency' THEN 1 WHEN ${bookings.priority} = 'urgent' THEN 2 ELSE 3 END`,
      desc(bookings.createdAt)
    );

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    if (filters.offset) {
      query = query.offset(filters.offset);
    }

    return await query;
  },

  // Get customer's booking history
  async getCustomerBookings(customerId: string) {
    return await db
      .select({
        id: bookings.id,
        title: bookings.title,
        status: bookings.status,
        priority: bookings.priority,
        serviceType: bookings.serviceType,
        scheduledTime: bookings.scheduledTime,
        completedAt: bookings.completedAt,
        actualCost: bookings.actualCost,
        rating: bookings.rating,
        review: bookings.review,
        technicianName: technicians.name,
        technicianPhone: technicians.phone,
        serviceNameEn: services.nameEn,
        serviceNameTa: services.nameTa,
        createdAt: bookings.createdAt
      })
      .from(bookings)
      .leftJoin(technicians, eq(bookings.assignedTechnicianId, technicians.id))
      .leftJoin(services, eq(bookings.serviceId, services.id))
      .where(eq(bookings.customerId, customerId))
      .orderBy(desc(bookings.createdAt));
  }
};

// Technician queries
export const technicianQueries = {
  // Get available technicians for a service
  async getAvailableTechnicians(serviceType: string, skills?: string[]) {
    let query = db
      .select({
        id: technicians.id,
        name: technicians.name,
        phone: technicians.phone,
        skills: technicians.skills,
        currentLocation: technicians.currentLocation,
        rating: technicians.rating,
        totalJobs: technicians.totalJobs,
        completedJobs: technicians.completedJobs
      })
      .from(technicians)
      .where(
        and(
          eq(technicians.status, 'available'),
          eq(technicians.isActive, true),
          sql`${technicians.skills} @> ${JSON.stringify([serviceType])}`
        )
      );

    if (skills && skills.length > 0) {
      // Check if technician has any of the required skills
      const skillConditions = skills.map(skill => 
        sql`${technicians.skills} @> ${JSON.stringify([skill])}`
      );
      query = query.where(and(
        eq(technicians.status, 'available'),
        eq(technicians.isActive, true),
        or(...skillConditions)
      ));
    }

    return await query.orderBy(desc(technicians.rating), desc(technicians.completedJobs));
  },

  // Get technician performance metrics
  async getTechnicianMetrics(technicianId: string) {
    const [metrics] = await db
      .select({
        totalJobs: technicians.totalJobs,
        completedJobs: technicians.completedJobs,
        rating: technicians.rating,
        avgCustomerRating: sql<number>`AVG(${reviews.rating})`,
        totalReviews: sql<number>`COUNT(${reviews.id})`,
        thisWeekJobs: sql<number>`COUNT(CASE WHEN ${bookings.createdAt} >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END)`,
        thisMonthRevenue: sql<number>`SUM(CASE WHEN ${bookings.completedAt} >= CURRENT_DATE - INTERVAL '30 days' AND ${bookings.status} = 'completed' THEN ${bookings.actualCost} ELSE 0 END)`
      })
      .from(technicians)
      .leftJoin(bookings, eq(technicians.id, bookings.assignedTechnicianId))
      .leftJoin(reviews, eq(technicians.id, reviews.technicianId))
      .where(eq(technicians.id, technicianId))
      .groupBy(technicians.id, technicians.totalJobs, technicians.completedJobs, technicians.rating);

    return metrics;
  }
};

// Product queries
export const productQueries = {
  // Get products with inventory info
  async getProductsWithInventory(filters?: {
    category?: string;
    lowStock?: boolean;
    search?: string;
  }) {
    let query = db
      .select({
        id: products.id,
        nameEn: products.nameEn,
        nameTa: products.nameTa,
        category: products.category,
        brand: products.brand,
        price: products.price,
        discountedPrice: products.discountedPrice,
        stockQuantity: products.stockQuantity,
        reorderLevel: products.reorderLevel,
        images: products.images,
        totalSold: products.totalSold,
        lastSoldAt: products.lastSoldAt,
        isActive: products.isActive,
        isFeatured: products.isFeatured
      })
      .from(products);

    const conditions = [eq(products.isActive, true)];

    if (filters?.category) {
      conditions.push(eq(products.category, filters.category as any));
    }

    if (filters?.lowStock) {
      conditions.push(sql`${products.stockQuantity} <= ${products.reorderLevel}`);
    }

    if (filters?.search) {
      conditions.push(
        or(
          like(products.nameEn, `%${filters.search}%`),
          like(products.nameTa, `%${filters.search}%`),
          like(products.brand, `%${filters.search}%`)
        )
      );
    }

    return await query
      .where(and(...conditions))
      .orderBy(desc(products.isFeatured), asc(products.nameEn));
  },

  // Update product stock
  async updateProductStock(productId: string, quantity: number, transactionType: 'purchase' | 'sale' | 'adjustment') {
    return await db.transaction(async (tx) => {
      // Get current stock
      const [product] = await tx
        .select({ stockQuantity: products.stockQuantity })
        .from(products)
        .where(eq(products.id, productId));

      if (!product) {
        throw new Error('Product not found');
      }

      let newQuantity: number;
      let balanceAfter: number;

      switch (transactionType) {
        case 'purchase':
          newQuantity = quantity; // Add to stock
          balanceAfter = product.stockQuantity + quantity;
          break;
        case 'sale':
          newQuantity = -quantity; // Remove from stock
          balanceAfter = product.stockQuantity - quantity;
          if (balanceAfter < 0) {
            throw new Error('Insufficient stock');
          }
          break;
        case 'adjustment':
          newQuantity = quantity; // Can be positive or negative
          balanceAfter = product.stockQuantity + quantity;
          break;
      }

      // Update product stock
      await tx
        .update(products)
        .set({ 
          stockQuantity: balanceAfter,
          updatedAt: new Date()
        })
        .where(eq(products.id, productId));

      // Record transaction
      await tx.insert(inventoryTransactions).values({
        productId,
        transactionType,
        quantity: newQuantity,
        balanceAfter,
        performedBy: 'system', // This should be the actual user ID
        createdAt: new Date()
      });

      return balanceAfter;
    });
  }
};

// Review queries
export const reviewQueries = {
  // Get reviews for a technician
  async getTechnicianReviews(technicianId: string, limit = 10) {
    return await db
      .select({
        id: reviews.id,
        rating: reviews.rating,
        serviceRating: reviews.serviceRating,
        timeliness: reviews.timeliness,
        communication: reviews.communication,
        pricing: reviews.pricing,
        reviewText: reviews.reviewText,
        reviewTextTa: reviews.reviewTextTa,
        reviewPhotos: reviews.reviewPhotos,
        customerName: users.name,
        bookingTitle: bookings.title,
        serviceType: bookings.serviceType,
        createdAt: reviews.createdAt
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.customerId, users.id))
      .leftJoin(bookings, eq(reviews.bookingId, bookings.id))
      .where(
        and(
          eq(reviews.technicianId, technicianId),
          eq(reviews.isPublic, true)
        )
      )
      .orderBy(desc(reviews.createdAt))
      .limit(limit);
  },

  // Get average ratings for a service
  async getServiceRatings(serviceId: string) {
    const [ratings] = await db
      .select({
        avgRating: sql<number>`AVG(${reviews.rating})`,
        totalReviews: sql<number>`COUNT(${reviews.id})`,
        ratingBreakdown: sql<any>`json_build_object(
          '5', COUNT(CASE WHEN ${reviews.rating} = 5 THEN 1 END),
          '4', COUNT(CASE WHEN ${reviews.rating} = 4 THEN 1 END),
          '3', COUNT(CASE WHEN ${reviews.rating} = 3 THEN 1 END),
          '2', COUNT(CASE WHEN ${reviews.rating} = 2 THEN 1 END),
          '1', COUNT(CASE WHEN ${reviews.rating} = 1 THEN 1 END)
        )`
      })
      .from(reviews)
      .leftJoin(bookings, eq(reviews.bookingId, bookings.id))
      .where(eq(bookings.serviceId, serviceId));

    return ratings;
  }
};

// Export all query modules
export {
  getDashboardMetrics,
  getTechnicianPerformance,
  getPopularServices,
  getLowStockProducts,
  getBookingsByDateRange,
  searchBookings
} from './utils';