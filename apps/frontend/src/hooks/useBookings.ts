// apps/frontend/src/hooks/useBookings.ts
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '../lib/api';

export const useCreateBooking = () => {
  return useMutation({
    mutationFn: apiClient.createBooking,
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
    queryFn: apiClient.getMyBookings,
  });
};