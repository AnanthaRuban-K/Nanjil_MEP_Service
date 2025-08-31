import { useMutation, useQuery } from "@tanstack/react-query";
import api from "../utils/api";

// ✅ Create Booking (with photos)
export function useCreateBooking() {
  return useMutation({
    mutationFn: async (formData: any) => {
      const data = new FormData();

      // text fields
      data.append("serviceType", formData.serviceType);
      data.append("priority", formData.priority);
      data.append("description", formData.description);
      data.append("scheduledTime", formData.scheduledTime);

      // contact info
      if (formData.contactInfo) {
        data.append("contactInfo[name]", formData.contactInfo.name);
        data.append("contactInfo[phone]", formData.contactInfo.phone);
        data.append("contactInfo[address]", formData.contactInfo.address);
      }

      // photos (optional)
      if (formData.photos && formData.photos.length > 0) {
        formData.photos.forEach((file: File) => {
          data.append("photos", file);
        });
      }

      const res = await api.post("/bookings", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
  });
}

// ✅ Get My Bookings
export function useMyBookings() {
  return useQuery({
    queryKey: ["myBookings"],
    queryFn: async () => {
      const res = await api.get("/bookings/my");
      return res.data;
    },
  });
}

// ✅ Get Booking Details
export function useBookingDetails(id: string) {
  return useQuery({
    queryKey: ["booking", id],
    queryFn: async () => {
      const res = await api.get(`/bookings/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
}

// ✅ Cancel Booking
export function useCancelBooking(id: string) {
  return useMutation({
    mutationFn: async (reason: string) => {
      const res = await api.put(`/bookings/${id}/cancel`, { reason });
      return res.data;
    },
  });
}
