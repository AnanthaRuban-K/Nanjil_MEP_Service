// apps/frontend/src/components/customer/BookingSuccess.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '../../stores/auth-store';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { CheckCircle, Phone, MessageCircle, Home, Clock, User, MapPin, Calendar } from 'lucide-react';

interface CompletedBooking {
  bookingId: string;
  serviceType: 'electrical' | 'plumbing';
  priority: 'normal' | 'urgent' | 'emergency';
  description: string;
  contactInfo: {
    name: string;
    phone: string;
    address: string;
  };
  scheduledDate: string;
  timeSlotLabel: {
    english: string;
    tamil: string;
  };
  cost: number;
  status: string;
  createdAt: string;
}

interface TimelineEvent {
  id: string;
  titleEnglish: string;
  titleTamil: string;
  time: string;
  completed: boolean;
  current: boolean;
}

export const BookingSuccess: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language } = useAuthStore();
  
  const [bookingData, setBookingData] = useState<CompletedBooking | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);

  useEffect(() => {
    const bookingId = searchParams.get('bookingId');
    
    if (bookingId) {
      // Load completed booking data
      const completedData = sessionStorage.getItem('completedBooking');
      if (completedData) {
        const booking = JSON.parse(completedData);
        setBookingData(booking);
        generateTimeline(booking);
      }
    } else {
      // Redirect if no booking ID
      router.push('/');
    }
  }, [searchParams, router]);

  const generateTimeline = (booking: CompletedBooking) => {
    const events: TimelineEvent[] = [
      {
        id: 'booked',
        titleEnglish: 'Booking Confirmed',
        titleTamil: 'பதிவு உறுதிப்படுத்தப்பட்டது',
        time: new Date(booking.createdAt).toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        completed: true,
        current: false
      },
      {
        id: 'team-assigned',
        titleEnglish: 'Team will be assigned',
        titleTamil: 'குழு ஒதுக்கப்படும்',
        time: booking.priority === 'emergency' ? 'Within 15 mins' : 'Within 30 mins',
        completed: false,
        current: true
      },
      {
        id: 'team-arrives',
        titleEnglish: 'Team arrives at location',
        titleTamil: 'குழு இடத்திற்கு வரும்',
        time: booking.priority === 'emergency' ? 'Within 45 mins' : 'Scheduled time',
        completed: false,
        current: false
      },
      {
        id: 'work-completed',
        titleEnglish: 'Work completed',
        titleTamil: 'வேலை முடிந்தது',
        time: 'After service',
        completed: false,
        current: false
      },
      {
        id: 'payment',
        titleEnglish: 'Payment collection',
        titleTamil: 'பணம் வசூல்',
        time: 'Cash payment',
        completed: false,
        current: false
      }
    ];

    setTimeline(events);
  };

  const handleWhatsAppContact = () => {
    if (!bookingData) return;
    
    const message = language === 'ta'
      ? `உங்கள் பதிவு எண்: ${bookingData.bookingId}\nசேவை: ${getServiceTitle()}\nநேரம்: ${formatDateTime()}\nதயவுசெய்து எனது பதிவு குறித்து தகவல் தரவும்.`
      : `Your Booking ID: ${bookingData.bookingId}\nService: ${getServiceTitle()}\nTime: ${formatDateTime()}\nPlease provide updates about my booking.`;
    
    const whatsappUrl = `https://wa.me/919876500000?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handlePhoneCall = () => {
    window.open('tel:+919876500000', '_self');
  };

  const getServiceTitle = (): string => {
    if (!bookingData) return '';
    
    if (bookingData.serviceType === 'electrical') {
      return language === 'ta' ? 'மின்சாரம்' : 'Electrical';
    } else {
      return language === 'ta' ? 'குழாய்' : 'Plumbing';
    }
  };

  const formatDateTime = (): string => {
    if (!bookingData) return '';
    
    const date = new Date(bookingData.scheduledDate);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    let dateLabel = '';
    if (date.toDateString() === today.toDateString()) {
      dateLabel = language === 'ta' ? 'இன்று' : 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      dateLabel = language === 'ta' ? 'நாளை' : 'Tomorrow';
    } else {
      dateLabel = date.toLocaleDateString('en-IN', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      });
    }

    const timeSlot = language === 'ta'
      ? bookingData.timeSlotLabel.tamil
      : bookingData.timeSlotLabel.english;

    return `${dateLabel} - ${timeSlot}`;
  };

  if (!bookingData) {
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="max-w-2xl mx-auto p-4">
        {/* Success Header */}
        <div className="text-center pt-8 mb-8">
          <div className="mb-6">
            <CheckCircle className="w-20 h-20 text-green-600 mx-auto animate-pulse" />
          </div>
          <h1 className={`text-4xl font-black mb-4 text-green-700 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
            {language === 'ta' ? 'பதிவு முடிந்தது!' : 'Booking Confirmed!'}
          </h1>
          <p className={`text-lg text-gray-600 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
            {language === 'ta' 
              ? 'உங்கள் சேவை பதிவு வெற்றிகரமாக செய்யப்பட்டது'
              : 'Your service booking has been successfully placed'
            }
          </p>
        </div>

        {/* Booking ID Card */}
        <Card className="mb-6 bg-gradient-to-r from-primary-500 to-primary-600 text-white border-0">
          <div className="p-6 text-center">
            <p className={`text-lg font-medium mb-2 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
              {language === 'ta' ? 'உங்கள் பதிவு எண்:' : 'Your Booking ID:'}
            </p>
            <p className="text-3xl font-black tracking-wider">
              {bookingData.bookingId}
            </p>
            <p className={`text-sm mt-2 opacity-90 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
              {language === 'ta' 
                ? 'இந்த எண்ணை குறிப்பு எடுத்து வைக்கவும்'
                : 'Please save this number for reference'
              }
            </p>
          </div>
        </Card>

        {/* Next Steps */}
        <Card className="mb-6">
          <div className="p-6">
            <h3 className={`text-xl font-bold mb-4 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
              {language === 'ta' ? 'அடுத்த நடவடிக்கைகள்:' : 'What happens next:'}
            </h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className={`text-blue-800 font-medium ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
                {bookingData.priority === 'emergency' 
                  ? (language === 'ta' 
                    ? 'எங்கள் குழு 30 நிமிடத்தில் அழைப்பார்கள்'
                    : 'Our team will call within 30 minutes')
                  : (language === 'ta'
                    ? 'எங்கள் குழு 1 மணி நேரத்தில் அழைத்து நேரத்தை உறுதிப்படுத்துவார்கள்'
                    : 'Our team will call within 1 hour to confirm timing')
                }
              </p>
            </div>
          </div>
        </Card>

        {/* Timeline */}
        <Card className="mb-6">
          <div className="p-6">
            <h3 className={`text-xl font-bold mb-6 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
              {language === 'ta' ? 'சேவை முன்னேற்றம்:' : 'Service Progress:'}
            </h3>
            <div className="space-y-4">
              {timeline.map((event, index) => (
                <div key={event.id} className="flex items-center">
                  <div className={`w-4 h-4 rounded-full flex-shrink-0 ${
                    event.completed 
                      ? 'bg-green-500' 
                      : event.current 
                        ? 'bg-blue-500 animate-pulse' 
                        : 'bg-gray-300'
                  }`}></div>
                  <div className={`ml-4 flex-1 ${
                    event.current ? 'text-blue-700 font-medium' : 
                    event.completed ? 'text-green-700' : 'text-gray-500'
                  }`}>
                    <p className={language === 'ta' ? 'font-tamil' : 'font-english'}>
                      {language === 'ta' ? event.titleTamil : event.titleEnglish}
                    </p>
                    <p className="text-xs opacity-75">{event.time}</p>
                  </div>
                  {index < timeline.length - 1 && (
                    <div className="absolute ml-2 mt-6 w-px h-4 bg-gray-300"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Booking Details */}
        <Card className="mb-6">
          <div className="p-6">
            <h3 className={`text-xl font-bold mb-4 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
              {language === 'ta' ? 'பதிவு விவரங்கள்:' : 'Booking Details:'}
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-gray-500" />
                <span className={`font-medium ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
                  {bookingData.contactInfo.name}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gray-500" />
                <span>{bookingData.contactInfo.phone}</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                <span className={`text-sm ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
                  {bookingData.contactInfo.address}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className={language === 'ta' ? 'font-tamil' : 'font-english'}>
                  {formatDateTime()}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className={`font-medium ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
                  {getServiceTitle()} - ₹{bookingData.cost}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Contact Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Button
            onClick={handleWhatsAppContact}
            variant="secondary"
            size="lg"
            className="bg-green-500 text-white hover:bg-green-600 p-4 h-auto"
          >
            <div className="text-center">
              <MessageCircle className="w-6 h-6 mx-auto mb-2" />
              <div className={`font-bold ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
                {language === 'ta' ? 'WhatsApp மூலம் பேசு' : 'Chat on WhatsApp'}
              </div>
            </div>
          </Button>

          <Button
            onClick={handlePhoneCall}
            variant="secondary"
            size="lg"
            className="bg-blue-500 text-white hover:bg-blue-600 p-4 h-auto"
          >
            <div className="text-center">
              <Phone className="w-6 h-6 mx-auto mb-2" />
              <div className={`font-bold ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
                {language === 'ta' ? 'உடனே அழை' : 'Call Now'}
              </div>
            </div>
          </Button>
        </div>

        {/* Home Button */}
        <Button
          onClick={() => router.push('/')}
          variant="outline"
          size="lg"
          className="w-full p-4 h-auto"
        >
          <div className="flex items-center justify-center gap-2">
            <Home className="w-5 h-5" />
            <span className={`font-bold ${language === 'ta' ? 'font-ta' : 'font-english'}`}>
              {language === 'ta' ? 'முகப்புக்கு செல்' : 'Go to Home'}
            </span>
          </div>
        </Button>

        {/* Footer Note */}
        <div className="text-center mt-8 pb-8">
          <p className={`text-sm text-gray-500 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
            {language === 'ta' 
              ? 'நன்றி! எங்கள் சேவையை தேர்ந்தெடுத்ததற்கு நன்றி'
              : 'Thank you for choosing our service!'
            }
          </p>
        </div>
      </div>
    </div>
  );
};
