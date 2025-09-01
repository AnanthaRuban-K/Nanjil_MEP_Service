import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import { toast } from '../hooks/use-toast'

// Create QueryClient with optimized configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time: 5 minutes for most queries
      staleTime: 1000 * 60 * 5,
      // Cache time: 10 minutes
      gcTime: 1000 * 60 * 10,
      // Retry failed requests 3 times
      retry: 3,
      // Retry delay with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch on window focus for critical data
      refetchOnWindowFocus: false,
      // Don't refetch on mount if data exists and is not stale
      refetchOnMount: 'always',
      // Network mode: always try to fetch, but serve cache if offline
      networkMode: 'always',
    },
    mutations: {
      // Retry mutations once
      retry: 1,
      // Network mode for mutations
      networkMode: 'online',
      // Global error handler for mutations
      onError: (error: any) => {
        const message = error?.response?.data?.message || error?.message || 'Something went wrong'
        toast({
  variant: "destructive",  // error toast use panna
  title: "Error",
  description: message,
})
      },
    },
  },
})

// Global error handling
queryClient.setMutationDefaults(['booking'], {
  onError: (error: any) => {
    if (error?.response?.status === 401) {
      // Handle authentication errors
      window.location.href = '/login'
    }
  },
})

interface ReactQueryProviderProps {
  children: React.ReactNode
}

export const ReactQueryProvider: React.FC<ReactQueryProviderProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom" />
      )}
    </QueryClientProvider>
  )
}