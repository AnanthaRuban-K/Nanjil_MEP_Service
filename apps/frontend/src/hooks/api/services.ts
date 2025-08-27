import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api'

export interface Service {
  id: string
  name_ta: string
  name_en: string
  category: 'electrical' | 'plumbing'
  basePrice: number
  estimatedTime: string
  description_ta?: string
  description_en?: string
}

export interface ServiceArea {
  id: string
  name_ta: string
  name_en: string
  pincode: string
  estimatedArrival: string
  serviceCharge: number
}

// Get all services
export const useServices = () => {
  return useQuery({
    queryKey: ['services'],
    queryFn: async (): Promise<Service[]> => {
      const response = await api.get<{data: Service[]}>('/api/services')
      return response.data
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}

// Get service areas
export const useServiceAreas = () => {
  return useQuery({
    queryKey: ['service-areas'],
    queryFn: async (): Promise<ServiceArea[]> => {
      const response = await api.get<{data: ServiceArea[]}>('/api/services/areas')
      return response.data
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  })
}