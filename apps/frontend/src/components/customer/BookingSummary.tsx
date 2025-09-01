// apps/frontend/src/components/customer/BookingSummary.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../stores/auth-store';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { ArrowLeft, User, Phone, MapPin, Clock, Wrench, FileText, CreditCard } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../../lib/api';

export type Priority = 'normal' | 'urgent' | 'emergency';

interface BookingData {
  serviceType: 'electrical' | 'plumbing';
  priority: Priority;
  description: string;
  contactInfo: {
    name: string;
    phone: string;
    address: string;
  };
  scheduledDate: string;
  timeSlot: string;
  timeSlotLabel: {
    english: string;
    tamil: string;
  };
}

export const BookingSummary: React.FC = () => {
  const router = useRouter();
  const { language } = useAuthStore();
  
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [totalCost, setTotalCost] = useState(0);

  // Create booking mutation
  const createBooking = useMutation({
    mutationFn: async (data: BookingData) => {
      const formData = new FormData();
      formData.append('serviceType', data.serviceType);
      formData.append('priority', data.priority);
      formData.append('description', data.description);
      formData.append('scheduledTime', data.scheduledDate);
      formData.append('contactInfo', JSON.stringify(data.contactInfo));
      formData.append('location', JSON.stringify({ lat: 8.1774, lng: 77.4063 }));
      
      return await apiClient.post('/api/bookings', formData);
    },
    onSuccess: (data) => {
      sessionStorage.removeItem('bookingData');
      router.push(`/success?bookingId=${data.booking.bookingNumber}`);
    },
    onError: (error: any) => {
      console.error('Booking error:', error);
      alert(language === 'ta' ? 'பதிவு தோல்வியடைந்தது!' : 'Booking failed!');
    },
  });

  useEffect(() => {
  const savedData = sessionStorage.getItem('bookingData');
  if (savedData) {
    const data = JSON.parse(savedData);
    setBookingData(data);
    
    // Calculate cost with proper typing
    const serviceFees: Record<string, number> = { 
      electrical: 300, 
      plumbing: 350 
    };
    
    // Type assertion or safe access
    const serviceType = data.serviceType as 'electrical' | 'plumbing';
    const baseCost = serviceFees[serviceType] ?? 300; // Use nullish coalescing for safety
    
    const emergencyMultiplier = data.priority === 'emergency' ? 1.5 : 1;
    const travelCharge = 50;
    setTotalCost((baseCost * emergencyMultiplier) + travelCharge);
  } else {
    router.push('/services');
  }
}, [router]);

  const handleConfirmBooking = () => {
    if (!bookingData) return;
    createBooking.mutate(bookingData);
  };

  if (!bookingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p>{language === 'ta' ? 'ஏற்றுகிறது...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  const serviceTitle = bookingData.serviceType === 'electrical'
    ? (language === 'ta' ? 'மின்சாரம்' : 'Electrical')
    : (language === 'ta' ? 'குழாய்' : 'Plumbing');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="max-w-2xl mx-auto p-4">
        <div className="flex items-center justify-between mb-8 pt-4">
          <Button variant="ghost" onClick={() => router.back()} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            <span>{language === 'ta' ? 'பின்னால்' : 'Back'}</span>
          </Button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-black mb-4">
            {language === 'ta' ? 'விபரங்களை சரிபார்' : 'Confirm Details'}
          </h1>
          <p className="text-lg text-gray-600">
            {language === 'ta' 
              ? 'உங்கள் பதிவு விபரங்களை பார்க்கவும்'
              : 'Review your booking details'
            }
          </p>
        </div>

        <Card className="mb-6">
          <div className="p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {language === 'ta' ? 'பதிவு விபரங்கள்' : 'Booking Details'}
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Wrench className="w-5 h-5 text-gray-500" />
                <div>
                  <span className="text-sm text-gray-600">
                    {language === 'ta' ? 'சேவை:' : 'Service:'}
                  </span>
                  <p className="font-bold text-lg">{serviceTitle}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-gray-500 mt-1" />
                <div>
                  <span className="text-sm text-gray-600">
                    {language === 'ta' ? 'பெயர்:' : 'Name:'}
                  </span>
                  <p className="font-bold">{bookingData.contactInfo.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-500" />
                <div>
                  <span className="text-sm text-gray-600">
                    {language === 'ta' ? 'மொபைல்:' : 'Mobile:'}
                  </span>
                  <p className="font-bold">{bookingData.contactInfo.phone}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-500 mt-1" />
                <div>
                  <span className="text-sm text-gray-600">
                    {language === 'ta' ? 'முகவரி:' : 'Address:'}
                  </span>
                  <p className="font-medium">{bookingData.contactInfo.address}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-500" />
                <div>
                  <span className="text-sm text-gray-600">
                    {language === 'ta' ? 'நேரம்:' : 'Time:'}
                  </span>
                  <p className="font-bold">
                    {new Date(bookingData.scheduledDate).toLocaleDateString()} - {
                      language === 'ta' 
                        ? bookingData.timeSlotLabel.tamil
                        : bookingData.timeSlotLabel.english
                    }
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <span className="text-sm text-gray-600">
                  {language === 'ta' ? 'பிரச்சினை:' : 'Problem:'}
                </span>
                <p className="mt-2 text-gray-800">{bookingData.description}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="mb-6">
          <div className="p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              {language === 'ta' ? 'கட்டணம்' : 'Payment'}
            </h3>
            
            <div className="flex justify-between text-lg font-bold">
              <span>{language === 'ta' ? 'மொத்தம்:' : 'Total:'}</span>
              <span>₹{totalCost}</span>
            </div>

            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                {language === 'ta' 
                  ? 'சேவை பார்த்த பிறக கொடுக்கவும்'
                  : 'Pay after service completion'
                }
              </p>
            </div>
          </div>
        </Card>

        <Button onClick={handleConfirmBooking} size="lg" className="w-full" disabled={createBooking.isPending}>
          <span className="text-lg font-bold">
            {createBooking.isPending
              ? (language === 'ta' ? 'பதிவு செய்யப்படுகிறது...' : 'Booking...')
              : (language === 'ta' ? 'உறுதிப்படுத்து' : 'CONFIRM BOOKING')
            }
          </span>
        </Button>
      </div>
    </div>
  );
};