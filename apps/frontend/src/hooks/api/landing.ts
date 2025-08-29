import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { Service, ServiceArea, DashboardStats } from '../../types/landing-page'

// Get all services for landing page
export const useServices = () => {
  return useQuery({
    queryKey: ['services'],
    queryFn: async (): Promise<Service[]> => {
      const response = await api.get<{data: Service[]}>('/api/services')
      return response.data || []
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: 3,
    refetchOnWindowFocus: false,
  })
}

// Get service areas
export const useServiceAreas = (pincode?: string) => {
  return useQuery({
    queryKey: ['service-areas', pincode],
    queryFn: async (): Promise<ServiceArea[]> => {
      const url = pincode ? `/api/services/areas?pincode=${pincode}` : '/api/services/areas'
      const response = await api.get<{data: ServiceArea[]}>(url)
      return response.data || []
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  })
}

// Check if service is available in area
export const useServiceAvailability = (pincode?: string) => {
  return useQuery({
    queryKey: ['service-availability', pincode],
    queryFn: async (): Promise<{ available: boolean }> => {
  if (!pincode) return { available: false }
  const response = await api.get<{ data: { available: boolean } }>(
    `/api/services/check-area?pincode=${pincode}`
  )
  return response.data
},

    enabled: !!pincode,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// Get dashboard stats for landing page (public stats)
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async (): Promise<DashboardStats> => {
      const response = await api.get<{data: DashboardStats}>('/api/stats/public')
      return response.data || {
        totalCustomers: 500,
        totalBookings: 1200,
        averageRating: 4.6,
        availableTeams: 3
      }
    },
    staleTime: 1000 * 60 * 15, // 15 minutes
  })
}