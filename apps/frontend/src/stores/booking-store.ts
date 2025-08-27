// apps/frontend/src/stores/booking-store.ts - Fixed with Local Types
import { create } from 'zustand';
import type { 
  Booking, 
  ServiceType, 
  BookingStatus, 
  //Priority,
  ContactInfo,
  Location
} from '../types';

interface BookingStep {
  service?: ServiceType;
  description?: string;
  photos?: string[];
  contactInfo?: ContactInfo;
  location?: Location;
  scheduledTime?: string;
  //priority?: Priority;
}

interface BookingState {
  // Current booking creation
  currentBooking: BookingStep;
  currentStep: number;
  totalSteps: number;
  
  // User's bookings
  myBookings: Booking[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  updateBookingStep: (data: Partial<BookingStep>) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetBooking: () => void;
  setMyBookings: (bookings: Booking[]) => void;
  addBooking: (booking: Booking) => void;
  updateBookingStatus: (bookingId: string, status: BookingStatus) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useBookingStore = create<BookingState>((set, get) => ({
  currentBooking: {},
  currentStep: 1,
  totalSteps: 6, // service -> describe -> contact -> schedule -> summary -> success
  myBookings: [],
  isLoading: false,
  error: null,

  updateBookingStep: (data) => {
    const { currentBooking } = get();
    set({ 
      currentBooking: { ...currentBooking, ...data },
      error: null 
    });
  },

  nextStep: () => {
    const { currentStep, totalSteps } = get();
    if (currentStep < totalSteps) {
      set({ currentStep: currentStep + 1 });
    }
  },

  prevStep: () => {
    const { currentStep } = get();
    if (currentStep > 1) {
      set({ currentStep: currentStep - 1 });
    }
  },

  resetBooking: () => set({ 
    currentBooking: {}, 
    currentStep: 1,
    error: null 
  }),

  setMyBookings: (myBookings) => set({ myBookings }),

  addBooking: (booking) => {
    const { myBookings } = get();
    set({ myBookings: [booking, ...myBookings] });
  },

  updateBookingStatus: (bookingId, status) => {
    const { myBookings } = get();
    const updatedBookings = myBookings.map(booking =>
      booking.id === bookingId 
        ? { ...booking, status, updatedAt: new Date().toISOString() }
        : booking
    );
    set({ myBookings: updatedBookings });
  },

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),
}));