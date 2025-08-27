// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Additional utility functions for the Nanjil MEP app
export function formatPhoneNumber(phone: string): string {
  // Format Indian phone numbers
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  return phone;
}

export function generateBookingId(): string {
  const date = new Date();
  const dateStr = date.getFullYear().toString().slice(-2) + 
                  (date.getMonth() + 1).toString().padStart(2, '0') + 
                  date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `NMS${dateStr}${random}`;
}

export function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function getTamilTimeSlot(timeSlot: string): string {
  const timeSlotMap: Record<string, string> = {
    '09:00-11:00': 'காலை 9-11',
    '11:00-13:00': 'முற்பகல் 11-1',
    '14:00-16:00': 'மதியம் 2-4',
    '16:00-18:00': 'மாலை 4-6',
    '18:00-20:00': 'இரவு 6-8',
  };
  return timeSlotMap[timeSlot] || timeSlot;
}