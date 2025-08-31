export interface ContactInfo {
  name: string
  phone: string
  address: string
}

export interface Location {
  lat: number
  lng: number
}

export interface CreateBookingRequest {
  serviceType: 'electrical' | 'plumbing'
  priority: 'normal' | 'urgent' | 'emergency'
  description: string
  contactInfo: ContactInfo
  location?: Location
  scheduledTime: string
  photos?: string[]
}

export interface BookingResponse {
  booking: {
    id: number
    bookingNumber: string
    serviceType: string
    priority: string
    description: string
    contactInfo: ContactInfo
    scheduledTime: string
    status: string
    totalCost: string
    createdAt: string
  }
}