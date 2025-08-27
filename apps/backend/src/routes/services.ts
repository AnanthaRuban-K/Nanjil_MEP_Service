import { Hono } from 'hono'
import { db } from '../db/index'
import { serviceCategories, serviceAreas } from '../db/schema'
import { eq, and } from 'drizzle-orm'

export const serviceRoutes = new Hono()

// Get available services
serviceRoutes.get('/', async (c) => {
  const category = c.req.query('category')
  const language = c.req.query('language') || 'ta'
  
  try {
    const services = await db
      .select()
      .from(serviceCategories)
      .where(
        and(
          eq(serviceCategories.isActive, true),
          category ? eq(serviceCategories.category, category as any) : undefined
        )
      )
      .orderBy(serviceCategories.sortOrder)

    // Group services by category
    const servicesByCategory = services.reduce((acc, service) => {
      const categoryKey = service.category
      if (!acc[categoryKey]) {
        acc[categoryKey] = {
          id: `service_${categoryKey}`,
          name_ta: categoryKey === 'electrical' ? 'மின்சார சேவைகள்' : 'குழாய் சேவைகள்',
          name_en: categoryKey === 'electrical' ? 'Electrical Services' : 'Plumbing Services',
          category: categoryKey,
          subcategories: []
        }
      }
      
      acc[categoryKey].subcategories.push({
        id: service.id,
        name_ta: service.nameTa,
        name_en: service.nameEn,
        basePrice: service.basePrice,
        estimatedTime: service.estimatedTime,
        description_ta: service.descriptionTa,
        description_en: service.descriptionEn,
        isEmergency: service.isEmergency
      })
      
      return acc
    }, {} as any)

    // Emergency services
    const emergencyServices = services
      .filter(s => s.isEmergency)
      .map(s => ({
        id: `emergency_${s.id}`,
        name_ta: `அவசர ${s.nameTa}`,
        name_en: `Emergency ${s.nameEn}`,
        available24x7: true,
        responseTime: "15-30 minutes",
        additionalCharge: 100
      }))

    return c.json({
      services: Object.values(servicesByCategory),
      emergencyServices
    })
  } catch (error) {
    console.error('Services fetch error:', error)
    return c.json({
      success: false,
      error: { message: 'Failed to fetch services' }
    }, 500)
  }
})

// Get service areas by pincode
serviceRoutes.get('/areas', async (c) => {
  const pincode = c.req.query('pincode')
  const language = c.req.query('language') || 'ta'
  
  if (!pincode) {
    return c.json({
      success: false,
      error: { message: 'Pincode is required' }
    }, 400)
  }

  try {
    const areas = await db
      .select()
      .from(serviceAreas)
      .where(
        and(
          eq(serviceAreas.pincode, pincode),
          eq(serviceAreas.isActive, true)
        )
      )

    const covered = areas.length > 0

    return c.json({
      covered,
      areas: areas.map(area => ({
        id: area.id,
        name_ta: area.nameTa,
        name_en: area.nameEn,
        pincode: area.pincode,
        estimatedArrival: area.estimatedArrival,
        serviceCharge: area.serviceCharge
      })),
      nearestServiceCenter: {
        name: "நாஞ்சில் MEP Service Center",
        address: "456, முக்கிய சாலை, நாகர்கோவில்",
        phone: "9876500000",
        distance: "2.5 km"
      }
    })
  } catch (error) {
    console.error('Service areas fetch error:', error)
    return c.json({
      success: false,
      error: { message: 'Failed to fetch service areas' }
    }, 500)
  }
})