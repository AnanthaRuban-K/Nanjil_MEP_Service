export interface Service {
  id: string
  name_ta: string
  name_en: string
  category: 'electrical' | 'plumbing'
  basePrice: number
  estimatedTime: string
  description_ta: string
  description_en: string
  subcategories?: ServiceSubcategory[]
}

export interface ServiceSubcategory {
  id: string
  name_ta: string
  name_en: string
  basePrice: number
  estimatedTime: string
  description_ta: string
  description_en: string
  isEmergency: boolean
}

export interface ServiceArea {
  id: string
  name_ta: string
  name_en: string
  pincode: string
  estimatedArrival: string
  serviceCharge: number
}

export interface DashboardStats {
  totalCustomers: number
  totalBookings: number
  averageRating: number
  availableTeams: number
}