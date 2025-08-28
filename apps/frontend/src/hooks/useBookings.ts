// apps/frontend/src/hooks/useBookings.ts
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../lib/api'; // Changed from apiClient to api

export const useCreateBooking = () => {
  return useMutation({
    mutationFn: (bookingData) => api.post('/api/bookings', bookingData),
    onSuccess: () => {
      // Handle success - navigate to success page
    },
    onError: (error) => {
      // Handle error - show error message
    }
  });
};

export const useMyBookings = () => {
  return useQuery({
    queryKey: ['bookings'],
    queryFn: () => api.get('/api/bookings/my'),
  });
};