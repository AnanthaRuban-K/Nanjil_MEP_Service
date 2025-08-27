import { Hono } from 'hono'
import { z } from 'zod'
import { db } from '../db/index'
import { bookings, bookingStatusHistory, users, teams } from '../db/schema'
import { eq, and, desc, SQL } from 'drizzle-orm'
import { authMiddleware } from '../middleware/auth'
import { validateRequest } from '../middleware/validation'
import { generateBookingNumber } from '../utils/booking'
import { sendBookingNotification } from '../utils/notifications'
import type { Language, Booking } from '../types'

// Extend the context variables
type Variables = {
  user: {
    id: string
    language: 'en' | 'ta'
  }
  validatedData: any
}

export const bookingRoutes = new Hono<{ Variables: Variables }>()

// All booking routes require authentication
bookingRoutes.use('*', authMiddleware)

// Validation schema for creating bookings
const createBookingSchema = z.object({
  serviceType: z.enum(['electrical', 'plumbing', 'emergency']),
  serviceCategoryId: z.string().uuid().optional(),
  description: z.string().min(10, 'Please describe the problem in detail'),
  scheduledTime: z.string().datetime('Invalid date format'),
  priority: z.enum(['low', 'normal', 'high', 'emergency']).default('normal'),
  contactInfo: z.object({
    name: z.string().min(2, 'Name is required'),
    phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid mobile number'),
    address: z.string().min(20, 'Complete address is required')
  }),
  location: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180)
  }).optional(),
  photos: z.array(z.string().url()).default([]),
  urgentReason: z.string().optional()
})

// Validation schema for rescheduling
const rescheduleBookingSchema = z.object({
  newScheduledTime: z.string().datetime('Invalid date format'),
  reason: z.string().min(5, 'Please provide rescheduling reason')
})

// Validation schema for rating/feedback
const ratingSchema = z.object({
  rating: z.number().min(1).max(5),
  feedback: z.string().optional(),
  serviceQuality: z.number().min(1).max(5).optional(),
  timeliness: z.number().min(1).max(5).optional(),
  professionalism: z.number().min(1).max(5).optional()
})

// Helper function to transform database booking to API Booking format
function transformDbBookingToApiBooking(dbBooking: any, team?: any): Booking {
  return {
    id: dbBooking.id,
    bookingNumber: dbBooking.bookingNumber,
    customerId: dbBooking.customerId,
    serviceType: dbBooking.serviceType,
    status: dbBooking.status,
    priority: dbBooking.priority,
    title: `${dbBooking.serviceType} Service Request`, // Generate title from service type
    description: dbBooking.description,
    scheduledTime: dbBooking.scheduledTime.toISOString(),
    actualStartTime: dbBooking.startedAt?.toISOString(),
    actualEndTime: dbBooking.completedAt?.toISOString(),
    estimatedArrival: dbBooking.estimatedArrival?.toISOString(),
    estimatedDuration: dbBooking.estimatedDuration,
    estimatedCompletion: dbBooking.estimatedCompletion?.toISOString(),
    completionTime: dbBooking.actualDuration,
    eta: dbBooking.estimatedArrival 
      ? Math.ceil((new Date(dbBooking.estimatedArrival).getTime() - Date.now()) / (1000 * 60)) + ' minutes'
      : '30 minutes',
    
    // Contact & Location
    contactInfo: dbBooking.contactInfo,
    location: dbBooking.location,
    serviceArea: undefined, // Will be populated if needed
    
    // Media
    photos: dbBooking.photos || [],
    beforePhotos: [],
    afterPhotos: [],
    videoUrl: undefined,
    
    // Team & Assignment
    assignedTeamId: dbBooking.assignedTeamId,
    assignedTeam: team ? {
      id: team.id,
      name: team.name,
      displayName: team.name,
      description: team.name,
      teamLead: undefined,
      members: [],
      skills: team.skills || [],
      specializations: [],
      status: team.status,
      phone: '', // Teams don't have direct phone in schema
      email: undefined,
      whatsappNumber: undefined,
      currentLocation: team.currentLocation,
      baseLocation: undefined,
      serviceRadius: 10,
      currentJobId: team.currentJobId,
      currentJob: undefined,
      vehicle: team.vehicle,
      equipment: [],
      performance: {
        totalJobs: team.totalJobs || 0,
        completedJobs: team.completedJobs || 0,
        cancelledJobs: 0,
        averageRating: parseFloat(team.averageRating?.toString() || '0'),
        averageJobTime: team.averageJobTime?.toString() || '0',
        averageResponseTime: '30 minutes',
        onTimePercentage: parseFloat(team.onTimePercentage?.toString() || '0'),
        completionRate: 0,
        customerSatisfactionScore: 0,
        reworkRate: 0,
        efficiency: 0,
        productivity: 0,
        recentJobs: 0,
        recentRating: 0,
        recentCompletion: 0,
        customerComplaints: 0,
        qualityIssues: 0,
        safetyViolations: 0,
        totalRevenue: 0,
        averageJobValue: 0,
        upsellRate: 0
      },
      statistics: {
        todayStats: {
          jobsScheduled: 0,
          jobsCompleted: 0,
          hoursWorked: 0,
          distanceTraveled: 0,
          revenue: 0,
          customerRatings: [],
          averageRating: 0
        },
        weekStats: {
          jobsCompleted: 0,
          hoursWorked: 0,
          revenue: 0,
          averageRating: 0,
          completionRate: 0
        },
        monthStats: {
          jobsCompleted: 0,
          revenue: 0,
          averageRating: 0,
          customerRetention: 0,
          growthRate: 0
        }
      },
      availability: {
        isAvailable: team.status === 'available',
        availabilityStatus: team.status === 'available' ? 'free' : 'busy',
        nextAvailable: team.estimatedFree?.toISOString(),
        estimatedFree: team.estimatedFree?.toISOString(),
        currentCapacity: 1,
        maxCapacity: 1,
        upcomingBookings: [],
        timeSlots: [],
        unavailableDates: [],
        breakTimes: []
      },
      workingHours: team.workingHours || {
        monday: { start: '09:00', end: '21:00', isWorking: true },
        tuesday: { start: '09:00', end: '21:00', isWorking: true },
        wednesday: { start: '09:00', end: '21:00', isWorking: true },
        thursday: { start: '09:00', end: '21:00', isWorking: true },
        friday: { start: '09:00', end: '21:00', isWorking: true },
        saturday: { start: '09:00', end: '21:00', isWorking: true },
        sunday: { start: '09:00', end: '21:00', isWorking: false }
      },
      serviceAreas: team.serviceAreas || [],
      excludedAreas: [],
      preferredServiceTypes: team.skills || [],
      maxJobsPerDay: 8,
      isEmergencyAvailable: team.isEmergencyAvailable || false,
      emergencyContactNumber: undefined,
      rating: parseFloat(team.averageRating?.toString() || '0'),
      totalRatings: 0,
      reviewCount: 0,
      completedJobs: team.completedJobs || 0,
      isActive: team.isActive,
      notes: team.notes,
      warnings: [],
      createdAt: team.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: team.updatedAt?.toISOString() || new Date().toISOString(),
      lastActiveAt: undefined
    } : undefined,
    assignedAt: undefined,
    reassignmentCount: 0,
    previousTeams: [],
    
    // Pricing & Payment
    quotedPrice: undefined,
    finalPrice: undefined,
    discountAmount: undefined,
    taxAmount: undefined,
    totalAmount: undefined,
    paymentStatus: 'pending', // Default status
    paymentMethod: undefined,
    advanceAmount: undefined,
    balanceAmount: undefined,
    
    // Materials & Parts
    partsUsed: [],
    materialCost: undefined,
    labourCost: undefined,
    
    // Quality & Feedback
    rating: undefined,
    review: undefined,
    reviewPhotos: [],
    serviceAspects: undefined,
    wouldRecommend: undefined,
    
    // Status & Permissions
    canCancel: dbBooking.canCancel,
    canReschedule: dbBooking.canReschedule,
    canRate: dbBooking.status === 'completed',
    cancellationReason: dbBooking.cancelReason,
    rescheduleReason: undefined,
    
    // Tracking
    statusHistory: [],
    timeline: [],
    trackingUpdates: [],
    
    // Admin
    adminNotes: dbBooking.adminNotes,
    internalNotes: undefined,
    qualityScore: undefined,
    issueFlags: [],
    
    // Timestamps
    createdAt: dbBooking.createdAt.toISOString(),
    updatedAt: dbBooking.updatedAt.toISOString(),
    cancelledAt: dbBooking.cancelledAt?.toISOString(),
    completedAt: dbBooking.completedAt?.toISOString()
  }
}

// Helper functions for status translations
function getStatusTitleTa(status: string): string {
  const statusMap: Record<string, string> = {
    'pending': 'காத்திருக்கிறது',
    'confirmed': 'உறுதி செய்யப்பட்டது',
    'in-progress': 'பணி நடந்து கொண்டிருக்கிறது',
    'completed': 'முடிக்கப்பட்டது',
    'cancelled': 'ரத்து செய்யப்பட்டது'
  }
  return statusMap[status] || status
}

function getStatusTitleEn(status: string): string {
  const statusMap: Record<string, string> = {
    'pending': 'Pending',
    'confirmed': 'Confirmed', 
    'in-progress': 'Work in Progress',
    'completed': 'Completed',
    'cancelled': 'Cancelled'
  }
  return statusMap[status] || status
}

function getStatusDescriptionTa(status: string, language: string): string {
  const descriptions: Record<string, { ta: string, en: string }> = {
    'pending': {
      ta: 'உங்கள் கோரிக்கை பெறப்பட்டது, விரைவில் குழு நியமிக்கப்படும்',
      en: 'Your request has been received, team will be assigned soon'
    },
    'confirmed': {
      ta: 'உங்கள் பதிவு உறுதி செய்யப்பட்டது',
      en: 'Your booking has been confirmed'
    },
    'in-progress': {
      ta: 'பணி நடந்து கொண்டிருக்கிறது',
      en: 'Work is currently in progress'
    },
    'completed': {
      ta: 'பணி வெற்றிகரமாக முடிக்கப்பட்டது',
      en: 'Work has been completed successfully'
    },
    'cancelled': {
      ta: 'பதிவு ரத்து செய்யப்பட்டது',
      en: 'Booking has been cancelled'
    }
  }
  
  return descriptions[status]?.[language === 'ta' ? 'ta' : 'en'] || ''
}

// Create new booking
bookingRoutes.post('/', validateRequest(createBookingSchema), async (c) => {
  const user = c.get('user')
  const bookingData = c.get('validatedData')
  
  try {
    // Generate unique booking number
    const bookingNumber = await generateBookingNumber()
    
    // Create booking
    const newBookings = await db
      .insert(bookings)
      .values({
        bookingNumber,
        customerId: user.id,
        serviceType: bookingData.serviceType,
        serviceCategoryId: bookingData.serviceCategoryId,
        description: bookingData.description,
        scheduledTime: new Date(bookingData.scheduledTime),
        priority: bookingData.priority,
        contactInfo: bookingData.contactInfo,
        location: bookingData.location,
        photos: bookingData.photos,
        status: 'pending',
        canCancel: true,
        canReschedule: true
      })
      .returning()
    
    const dbBooking = newBookings[0]

    // Create initial status history
    await db.insert(bookingStatusHistory).values({
      bookingId: dbBooking.id,
      status: 'pending',
      note: 'Booking created successfully',
      timestamp: new Date()
    })

    // Transform to API format
    const apiBooking = transformDbBookingToApiBooking(dbBooking)

    // Send notifications
    await sendBookingNotification(apiBooking, 'created', user.language as Language)

    // Find nearest teams for assignment suggestions (simplified)
    const availableTeams = await db
      .select()
      .from(teams)
      .where(
        and(
          eq(teams.status, 'available'),
          eq(teams.isActive, true)
        )
      )
      .limit(3)

    return c.json({
      success: true,
      booking: {
        ...apiBooking,
        statusHistory: [{
          status: 'pending',
          timestamp: dbBooking.createdAt,
          title: user.language === 'ta' ? 'பதிவு உருவாக்கப்பட்டது' : 'Booking Created',
          description: user.language === 'ta' 
            ? 'உங்கள் சேவை கோரிக்கை பெறப்பட்டது'
            : 'Your service request has been received'
        }],
        estimatedArrival: new Date(Date.now() + 45 * 60000).toISOString(),
        estimatedDuration: bookingData.serviceType === 'electrical' ? '1-2 hours' : '2-3 hours'
      },
      message: user.language === 'ta'
        ? 'பதிவு வெற்றிகரமாக உருவாக்கப்பட்டது! எங்கள் குழு விரைவில் அழைக்கும்.'
        : 'Booking created successfully! Our team will call you soon.',
      whatsappUrl: `https://wa.me/919876500000?text=Booking%20${bookingNumber}%20created`
    })
  } catch (error) {
    console.error('Booking creation error:', error)
    return c.json({
      success: false,
      error: {
        code: 'BOOKING_CREATION_FAILED',
        message: user.language === 'ta'
          ? 'பதிவு உருவாக்க முடியவில்லை. மீண்டும் முயற்சி செய்க.'
          : 'Failed to create booking. Please try again.'
      }
    }, 500)
  }
})

// Get user's bookings
bookingRoutes.get('/my', async (c) => {
  const user = c.get('user')
  const status = c.req.query('status') || 'all'
  const limit = parseInt(c.req.query('limit') || '10')
  const offset = parseInt(c.req.query('offset') || '0')
  
  try {
    let whereCondition: SQL<unknown> = eq(bookings.customerId, user.id)
    if (status !== 'all') {
      whereCondition = and(whereCondition, eq(bookings.status, status as any))!
    }

    const userBookings = await db
      .select({
        booking: bookings,
        team: teams
      })
      .from(bookings)
      .leftJoin(teams, eq(bookings.assignedTeamId, teams.id))
      .where(whereCondition)
      .orderBy(desc(bookings.createdAt))
      .limit(limit)
      .offset(offset)

    // Get status history for each booking
    const bookingsWithHistory = await Promise.all(
      userBookings.map(async ({ booking, team }) => {
        const statusHistory = await db
          .select()
          .from(bookingStatusHistory)
          .where(eq(bookingStatusHistory.bookingId, booking.id))
          .orderBy(desc(bookingStatusHistory.timestamp))

        const apiBooking = transformDbBookingToApiBooking(booking, team)
        
        return {
          ...apiBooking,
          statusHistory: statusHistory.map(history => ({
            status: history.status,
            timestamp: history.timestamp,
            title: user.language === 'ta' 
              ? getStatusTitleTa(history.status)
              : getStatusTitleEn(history.status),
            description: history.note || ''
          })),
          canCancel: booking.status === 'pending' || booking.status === 'confirmed',
          canReschedule: booking.status === 'pending'
        }
      })
    )

    // Summary statistics
    const totalBookings = userBookings.length
    const summary = {
      total: totalBookings,
      pending: userBookings.filter(b => b.booking.status === 'pending').length,
      completed: userBookings.filter(b => b.booking.status === 'completed').length,
      cancelled: userBookings.filter(b => b.booking.status === 'cancelled').length
    }

    return c.json({
      bookings: bookingsWithHistory,
      pagination: {
        total: totalBookings,
        limit,
        offset,
        hasMore: totalBookings === limit
      },
      summary
    })
  } catch (error) {
    console.error('Fetch bookings error:', error)
    return c.json({
      success: false,
      error: { message: 'Failed to fetch bookings' }
    }, 500)
  }
})

// Get specific booking details
bookingRoutes.get('/:id', async (c) => {
  const user = c.get('user')
  const bookingId = c.req.param('id')
  
  try {
    const bookingData = await db
      .select({
        booking: bookings,
        team: teams
      })
      .from(bookings)
      .leftJoin(teams, eq(bookings.assignedTeamId, teams.id))
      .where(
        and(
          eq(bookings.id, bookingId),
          eq(bookings.customerId, user.id)
        )
      )
      .limit(1)

    if (!bookingData.length) {
      return c.json({
        success: false,
        error: { message: 'Booking not found' }
      }, 404)
    }

    const { booking, team } = bookingData[0]

    // Get status history
    const statusHistory = await db
      .select()
      .from(bookingStatusHistory)
      .where(eq(bookingStatusHistory.bookingId, booking.id))
      .orderBy(bookingStatusHistory.timestamp)

    // Build timeline
    const timeline = statusHistory.map(history => ({
      status: history.status,
      timestamp: history.timestamp,
      title: user.language === 'ta' 
        ? getStatusTitleTa(history.status)
        : getStatusTitleEn(history.status),
      description: history.note || getStatusDescriptionTa(history.status, user.language)
    }))

    const apiBooking = transformDbBookingToApiBooking(booking, team)

    return c.json({
      booking: {
        ...apiBooking,
        timeline,
        estimatedCompletion: booking.estimatedCompletion?.toISOString() || 
          new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        canCancel: booking.status === 'pending' || booking.status === 'confirmed'
      }
    })
  } catch (error) {
    console.error('Fetch booking error:', error)
    return c.json({
      success: false,
      error: { message: 'Failed to fetch booking details' }
    }, 500)
  }
})

// Cancel booking
bookingRoutes.put('/:id/cancel', validateRequest(z.object({
  reason: z.string().min(5, 'Please provide cancellation reason'),
  reschedule: z.boolean().default(false)
})), async (c) => {
  const user = c.get('user')
  const bookingId = c.req.param('id')
  const { reason, reschedule } = c.get('validatedData')
  
  try {
    // Check if booking exists and belongs to user
    const existingBookings = await db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.id, bookingId),
          eq(bookings.customerId, user.id)
        )
      )
      .limit(1)

    if (!existingBookings.length) {
      return c.json({
        success: false,
        error: { message: 'Booking not found' }
      }, 404)
    }

    const booking = existingBookings[0]

    if (!booking.canCancel || booking.status === 'cancelled' || booking.status === 'completed') {
      return c.json({
        success: false,
        error: {
          code: 'CANNOT_CANCEL',
          message: user.language === 'ta'
            ? 'இந்த பதிவை ரத்து செய்ய முடியாது'
            : 'This booking cannot be cancelled'
        }
      }, 400)
    }

    // Update booking status
    const updatedBookings = await db
      .update(bookings)
      .set({
        status: 'cancelled',
        cancelledAt: new Date(),
        cancelReason: reason,
        updatedAt: new Date()
      })
      .where(eq(bookings.id, bookingId))
      .returning()

    // Add to status history
    await db
      .insert(bookingStatusHistory)
      .values({
        bookingId: bookingId,
        status: 'cancelled',
        previousStatus: booking.status,
        note: `Cancelled by customer: ${reason}`,
        timestamp: new Date()
      })

    const apiBooking = transformDbBookingToApiBooking(updatedBookings[0])
    
    // Send notification
    await sendBookingNotification(apiBooking, 'cancelled', user.language)

    return c.json({
      success: true,
      booking: {
        ...apiBooking,
        status: 'cancelled'
      },
      message: user.language === 'ta'
        ? 'பதிவு வெற்றிகரமாக ரத்து செய்யப்பட்டது'
        : 'Booking cancelled successfully',
      rescheduleMessage: reschedule 
        ? (user.language === 'ta' 
          ? 'புதிய பதிவுக்காக மீண்டும் முயற்சி செய்யவும்'
          : 'Please create a new booking for rescheduling')
        : null
    })
  } catch (error) {
    console.error('Cancel booking error:', error)
    return c.json({
      success: false,
      error: {
        code: 'CANCELLATION_FAILED',
        message: user.language === 'ta'
          ? 'பதிவை ரத்து செய்ய முடியவில்லை'
          : 'Failed to cancel booking'
      }
    }, 500)
  }
})

// Reschedule booking
bookingRoutes.put('/:id/reschedule', validateRequest(rescheduleBookingSchema), async (c) => {
  const user = c.get('user')
  const bookingId = c.req.param('id')
  const { newScheduledTime, reason } = c.get('validatedData')
  
  try {
    // Check if booking exists and can be rescheduled
    const existingBookings = await db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.id, bookingId),
          eq(bookings.customerId, user.id)
        )
      )
      .limit(1)

    if (!existingBookings.length) {
      return c.json({
        success: false,
        error: { message: 'Booking not found' }
      }, 404)
    }

    const booking = existingBookings[0]

    if (!booking.canReschedule || booking.status !== 'pending') {
      return c.json({
        success: false,
        error: {
          code: 'CANNOT_RESCHEDULE',
          message: user.language === 'ta'
            ? 'இந்த பதிவை மீண்டும் திட்டமிட முடியாது'
            : 'This booking cannot be rescheduled'
        }
      }, 400)
    }

    // Update booking with new schedule
    const updatedBookings = await db
      .update(bookings)
      .set({
        scheduledTime: new Date(newScheduledTime),
        status: 'pending', // Keep as pending after reschedule
        updatedAt: new Date()
      })
      .where(eq(bookings.id, bookingId))
      .returning()

    // Add to status history
    await db
      .insert(bookingStatusHistory)
      .values({
        bookingId: bookingId,
        status: 'pending',
        previousStatus: booking.status,
        note: `Rescheduled by customer: ${reason}. New time: ${newScheduledTime}`,
        timestamp: new Date()
      })

    const apiBooking = transformDbBookingToApiBooking(updatedBookings[0])
    
    // Send notification (you'll need to add 'rescheduled' type)
    // await sendBookingNotification(apiBooking, 'rescheduled', user.language)

    return c.json({
      success: true,
      booking: {
        ...apiBooking,
        status: 'pending'
      },
      message: user.language === 'ta'
        ? 'பதிவு வெற்றிகரமாக மீண்டும் திட்டமிடப்பட்டது'
        : 'Booking rescheduled successfully'
    })
  } catch (error) {
    console.error('Reschedule booking error:', error)
    return c.json({
      success: false,
      error: {
        code: 'RESCHEDULE_FAILED',
        message: user.language === 'ta'
          ? 'பதிவை மீண்டும் திட்டமிட முடியவில்லை'
          : 'Failed to reschedule booking'
      }
    }, 500)
  }
})

// Submit rating and feedback
bookingRoutes.post('/:id/rating', validateRequest(ratingSchema), async (c) => {
  const user = c.get('user')
  const bookingId = c.req.param('id')
  const ratingData = c.get('validatedData')
  
  try {
    // Check if booking exists and is completed
    const existingBookings = await db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.id, bookingId),
          eq(bookings.customerId, user.id),
          eq(bookings.status, 'completed')
        )
      )
      .limit(1)

    if (!existingBookings.length) {
      return c.json({
        success: false,
        error: {
          code: 'BOOKING_NOT_FOUND_OR_NOT_COMPLETED',
          message: user.language === 'ta'
            ? 'முடிக்கப்பட்ட பதிவு காணப்படவில்லை'
            : 'Completed booking not found'
        }
      }, 404)
    }

    const booking = existingBookings[0]

    // Create feedback entry (you'll need to import and use the feedback table)
    // For now, just add to status history
    await db
      .insert(bookingStatusHistory)
      .values({
        bookingId: bookingId,
        status: 'completed', // Keep as completed
        note: `Customer feedback: ${ratingData.rating}/5 stars - ${ratingData.feedback || 'No comments'}`,
        timestamp: new Date()
      })

    return c.json({
      success: true,
      message: user.language === 'ta'
        ? 'மதிப்பீடு வெற்றிகரமாக சமர்பிக்கப்பட்டது'
        : 'Rating submitted successfully',
      rating: {
        overall: ratingData.rating,
        serviceQuality: ratingData.serviceQuality,
        timeliness: ratingData.timeliness,
        professionalism: ratingData.professionalism,
        feedback: ratingData.feedback
      }
    })
  } catch (error) {
    console.error('Submit rating error:', error)
    return c.json({
      success: false,
      error: {
        code: 'RATING_SUBMISSION_FAILED',
        message: user.language === 'ta'
          ? 'மதிப்பீடு சமர்பிக்க முடியவில்லை'
          : 'Failed to submit rating'
      }
    }, 500)
  }
})

// Get booking statistics
bookingRoutes.get('/stats', async (c) => {
  const user = c.get('user')
  
  try {
    const userBookings = await db
      .select()
      .from(bookings)
      .where(eq(bookings.customerId, user.id))

    // Calculate average rating from feedback table instead
    // const avgRatingResult = await db
    //   .select({ avgRating: sql`AVG(${feedback.rating})` })
    //   .from(feedback)
    //   .where(eq(feedback.customerId, user.id))

    const stats = {
      total: userBookings.length,
      completed: userBookings.filter(b => b.status === 'completed').length,
      pending: userBookings.filter(b => b.status === 'pending').length,
      cancelled: userBookings.filter(b => b.status === 'cancelled').length,
      avgRating: 0, // Calculate from feedback table when implemented
      serviceTypes: {
        electrical: userBookings.filter(b => b.serviceType === 'electrical').length,
        plumbing: userBookings.filter(b => b.serviceType === 'plumbing').length,
        emergency: userBookings.filter(b => b.serviceType === 'emergency').length
      },
      monthlyBookings: getMonthlyStats(userBookings)
    }

    return c.json({
      success: true,
      stats
    })
  } catch (error) {
    console.error('Get stats error:', error)
    return c.json({
      success: false,
      error: { message: 'Failed to fetch statistics' }
    }, 500)
  }
})

// Helper function for monthly statistics
function getMonthlyStats(bookings: any[]): Record<string, number> {
  const monthlyStats: Record<string, number> = {}
  
  bookings.forEach(booking => {
    const month = new Date(booking.createdAt).toISOString().slice(0, 7)
    monthlyStats[month] = (monthlyStats[month] || 0) + 1
  })
  
  return monthlyStats
}