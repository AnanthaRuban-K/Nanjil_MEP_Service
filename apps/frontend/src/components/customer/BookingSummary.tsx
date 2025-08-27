// apps/frontend/src/components/customer/BookingSummary.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../stores/auth-store';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { ArrowLeft, User, Phone, MapPin, Clock, Wrench, FileText, CreditCard, AlertTriangle } from 'lucide-react';
import type { ServiceType } from '../../types';
export type Priority = 'normal' | 'urgent' | 'emergency';
interface BookingData {
  serviceType: ServiceType;
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
    en: string;
    ta: string;
  };
  photos?: File[];
}

interface CostBreakdown {
  serviceFee: number;
  emergencyCharge?: number;
  travelCharge?: number;
  total: number;
}

export const BookingSummary: React.FC = () => {
  const router = useRouter();
  const { language } = useAuthStore();
  
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [costBreakdown, setCostBreakdown] = useState<CostBreakdown | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load booking data and calculate costs
  useEffect(() => {
    const savedData = sessionStorage.getItem('bookingData');
    if (savedData) {
      const data = JSON.parse(savedData);
      setBookingData(data);
      calculateCosts(data);
    } else {
      // Redirect to start if no data
      router.push('/services');
    }
  }, [router]);

  const calculateCosts = (data: BookingData) => {
    // Base service fees
    const serviceFees = {
      electrical: 300,
      plumbing: 350
    };

    let serviceFee = serviceFees[data.serviceType] || 300;
    let emergencyCharge = 0;
    let travelCharge = 0;

    // Emergency service multiplier
    if (data.priority === 'emergency') {
      emergencyCharge = serviceFee * 0.5; // 50% extra for emergency
    }

    // Travel charges (simplified - in real app, calculate by distance)
    travelCharge = 50;

    const total = serviceFee + emergencyCharge + travelCharge;

    setCostBreakdown({
      serviceFee,
      emergencyCharge: emergencyCharge > 0 ? emergencyCharge : undefined,
      travelCharge,
      total
    });
  };

  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    let dateLabel = '';
    if (date.toDateString() === today.toDateString()) {
      dateLabel = language === 'ta' ? 'இன்று' : 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      dateLabel = language === 'ta' ? 'நாளை' : 'Tomorrow';
    } else {
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      };
      dateLabel = date.toLocaleDateString(
        language === 'ta' ? 'en-IN' : 'en-US', 
        options
      );
    }

    return dateLabel;
  };

  const getServiceTitle = (): string => {
    if (!bookingData) return '';
    
    if (bookingData.serviceType === 'electrical') {
      return language === 'ta' ? 'மின்சாரம்' : 'Electrical';
    } else {
      return language === 'ta' ? 'குழாய்' : 'Plumbing';
    }
  };

  const getPriorityLabel = (): string => {
    if (!bookingData) return '';
    
    const labels = {
      normal: { ta: 'வழக்கமான', en: 'Regular' },
      urgent: { ta: 'அவசியமான', en: 'Urgent' },
      emergency: { ta: 'அவசரம்', en: 'Emergency' }
    };
    
    return language === 'ta' 
      ? labels[bookingData.priority].ta
      : labels[bookingData.priority].en;
  };

  const handleConfirmBooking = async () => {
    if (!bookingData || !costBreakdown) return;

    setIsSubmitting(true);

    try {
      // In a real app, this would make an API call to create the booking
      // For now, we'll simulate the process
      
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call

      // Generate booking ID
      const bookingId = `NMS${Date.now().toString().slice(-6)}`;
      
      // Store final booking data
      const finalBookingData = {
        ...bookingData,
        bookingId,
        cost: costBreakdown.total,
        status: 'confirmed',
        createdAt: new Date().toISOString()
      };

      sessionStorage.setItem('completedBooking', JSON.stringify(finalBookingData));
      sessionStorage.removeItem('bookingData'); // Clear form data

      // Navigate to success page
      router.push(`/success?bookingId=${bookingId}`);
      
    } catch (error) {
      console.error('Booking failed:', error);
      alert(language === 'ta' 
        ? 'பதிவு தோல்வியடைந்தது. மீண்டும் முயற்சிக்கவும்.'
        : 'Booking failed. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!bookingData || !costBreakdown) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className={language === 'ta' ? 'font-tamil' : 'font-english'}>
            {language === 'ta' ? 'ஏற்றுகிறது...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="max-w-2xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pt-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center gap-2"
            disabled={isSubmitting}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className={language === 'ta' ? 'font-tamil' : 'font-english'}>
              {language === 'ta' ? 'பின்னால்' : 'Back'}
            </span>
          </Button>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className={`text-3xl font-black mb-4 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
            {language === 'ta' ? 'விபரங்களை சரிபார்' : 'Confirm Details'}
          </h1>
          <p className={`text-lg text-gray-600 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
            {language === 'ta' 
              ? 'உங்கள் பதிவு விபரங்களை பார்க்கவும்'
              : 'Review your booking details'
            }
          </p>
        </div>

        {/* Booking Details */}
        <Card className="mb-6">
          <div className="p-6">
            <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
              <FileText className="w-5 h-5" />
              {language === 'ta' ? 'பதিவு விபரங்கள்' : 'Booking Details'}
            </h3>
            
            <div className="space-y-4">
              {/* Service Type */}
              <div className="flex items-center gap-3">
                <Wrench className="w-5 h-5 text-gray-500" />
                <div>
                  <span className={`text-sm text-gray-600 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
                    {language === 'ta' ? 'சேவை:' : 'Service:'}
                  </span>
                  <p className={`font-bold text-lg ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
                    {getServiceTitle()}
                    {bookingData.priority === 'emergency' && (
                      <span className="ml-2 text-red-600">
                        ({getPriorityLabel()})
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Customer Info */}
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-gray-500 mt-1" />
                <div>
                  <span className={`text-sm text-gray-600 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
                    {language === 'ta' ? 'பெயர்:' : 'Name:'}
                  </span>
                  <p className={`font-bold ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
                    {bookingData.contactInfo.name}
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-500" />
                <div>
                  <span className={`text-sm text-gray-600 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
                    {language === 'ta' ? 'மொபைல்:' : 'Mobile:'}
                  </span>
                  <p className="font-bold">{bookingData.contactInfo.phone}</p>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-500 mt-1" />
                <div>
                  <span className={`text-sm text-gray-600 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
                    {language === 'ta' ? 'முகவரி:' : 'Address:'}
                  </span>
                  <p className={`font-medium ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
                    {bookingData.contactInfo.address}
                  </p>
                </div>
              </div>

              {/* Schedule */}
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-500" />
                <div>
                  <span className={`text-sm text-gray-600 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
                    {language === 'ta' ? 'நேரம்:' : 'Time:'}
                  </span>
                  <p className={`font-bold ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
                    {formatDateTime(bookingData.scheduledDate)} - {
                      language === 'ta' 
                        ? bookingData.timeSlotLabel.ta
                        : bookingData.timeSlotLabel.en
                    }
                  </p>
                </div>
              </div>

              {/* Problem Description */}
              <div className="border-t pt-4">
                <span className={`text-sm text-gray-600 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
                  {language === 'ta' ? 'பிரச்சினை:' : 'Problem:'}
                </span>
                <p className={`mt-2 text-gray-800 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
                  {bookingData.description}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Cost Breakdown */}
        <Card className="mb-6">
          <div className="p-6">
            <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
              <CreditCard className="w-5 h-5" />
              {language === 'ta' ? 'கட்டணம்' : 'Payment'}
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className={language === 'ta' ? 'font-tamil' : 'font-english'}>
                  {language === 'ta' ? 'சேவை கட்டணம்:' : 'Service Fee:'}
                </span>
                <span className="font-bold">₹{costBreakdown.serviceFee}</span>
              </div>
              
              {costBreakdown.emergencyCharge && (
                <div className="flex justify-between text-red-600">
                  <span className={language === 'ta' ? 'font-tamil' : 'font-english'}>
                    {language === 'ta' ? 'அவசர கட்டணம்:' : 'Emergency Charge:'}
                  </span>
                  <span className="font-bold">₹{costBreakdown.emergencyCharge}</span>
                </div>
              )}
              
              <div className="flex justify-between text-gray-600">
                <span className={language === 'ta' ? 'font-tamil' : 'font-english'}>
                  {language === 'ta' ? 'பயண கட்டணம்:' : 'Travel Charge:'}
                </span>
                <span>₹{costBreakdown.travelCharge}</span>
              </div>
              
              <div className="border-t pt-3 flex justify-between text-lg font-bold">
                <span className={language === 'ta' ? 'font-tamil' : 'font-english'}>
                  {language === 'ta' ? 'மொத்தம்:' : 'Total:'}
                </span>
                <span>₹{costBreakdown.total}</span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className={`text-sm text-yellow-800 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
                {language === 'ta' 
                  ? 'சேவை பார்த்த பிறக கொடுக்கவும்'
                  : 'Pay after service completion'
                }
              </p>
            </div>
          </div>
        </Card>

        {/* Emergency Service Warning */}
        {bookingData.priority === 'emergency' && (
          <Card className="mb-6 bg-red-50 border-red-200">
            <div className="p-4">
              <div className="flex items-center gap-2 text-red-700 mb-2">
                <AlertTriangle className="w-5 h-5" />
                <span className={`font-bold ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
                  {language === 'ta' ? 'அவசர சேவை' : 'Emergency Service'}
                </span>
              </div>
              <p className={`text-sm text-red-600 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
                {language === 'ta' 
                  ? 'எங்கள் குழு 30 நிமிடத்தில் அழைப்பார்கள்'
                  : 'Our team will call within 30 minutes'
                }
              </p>
            </div>
          </Card>
        )}

        {/* Confirmation Button */}
        <Button
          onClick={handleConfirmBooking}
          size="lg"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span className={language === 'ta' ? 'font-tamil' : 'font-english'}>
                {language === 'ta' ? 'பதிவு செய்யப்படுகிறது...' : 'Booking...'}
              </span>
            </div>
          ) : (
            <span className={`text-lg font-bold ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
              {language === 'ta' ? 'உறுதிப்படுத்து' : 'CONFIRM BOOKING'}
            </span>
          )}
        </Button>

        {/* Terms */}
        <div className="mt-4 text-center">
          <p className={`text-xs text-gray-500 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
            {language === 'ta' 
              ? 'பதிவு செய்வதன் மூலம் நீங்கள் எங்கள் சேவை நிபந்தனைகளை ஒப்புக்கொள்கிறீர்கள்'
              : 'By booking, you agree to our terms of service'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

