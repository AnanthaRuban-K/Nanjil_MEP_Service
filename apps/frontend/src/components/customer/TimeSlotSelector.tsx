'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../stores/auth-store';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { ArrowLeft, Calendar, Clock, AlertCircle } from 'lucide-react';

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  labelEnglish: string;
  labelTamil: string;
  available: boolean;
  price?: number;
}

interface DateOption {
  date: Date;
  dayLabel: {
    english: string;
    tamil: string;
  };
  available: boolean;
}

export const TimeSlotSelector: React.FC = () => {
  const router = useRouter();
  const { language } = useAuthStore();
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [bookingData, setBookingData] = useState<any>(null);

  // Generate next 7 days
  const generateDateOptions = (): DateOption[] => {
    const dates: DateOption[] = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const dayNames = {
        english: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        tamil: ['ஞாயிறு', 'திங்கள்', 'செவ்வாய்', 'புதன்', 'வியாழன்', 'வெள்ளி', 'சனி']
      };
      
      const dayIndex = date.getDay();
      const isToday = i === 0;
      const isTomorrow = i === 1;
      
      let dayLabel = {
        english: isToday ? 'Today' : isTomorrow ? 'Tomorrow' : dayNames.english[dayIndex],
        tamil: isToday ? 'இன்று' : isTomorrow ? 'நாளை' : dayNames.tamil[dayIndex]
      };
      
      dates.push({
        date,
        dayLabel,
        available: true // In real app, check team availability
      });
    }
    
    return dates;
  };

  const [dateOptions] = useState<DateOption[]>(generateDateOptions());

  // Time slots based on service hours (8 AM - 8 PM)
  const timeSlots: TimeSlot[] = [
    {
      id: '09:00-11:00',
      startTime: '09:00',
      endTime: '11:00',
      labelEnglish: '9:00-11:00 AM',
      labelTamil: 'காலை 9-11',
      available: true
    },
    {
      id: '11:00-13:00',
      startTime: '11:00',
      endTime: '13:00',
      labelEnglish: '11:00 AM-1:00 PM',
      labelTamil: 'முற்பகல் 11-1',
      available: true
    },
    {
      id: '14:00-16:00',
      startTime: '14:00',
      endTime: '16:00',
      labelEnglish: '2:00-4:00 PM',
      labelTamil: 'மதியம் 2-4',
      available: true
    },
    {
      id: '16:00-18:00',
      startTime: '16:00',
      endTime: '18:00',
      labelEnglish: '4:00-6:00 PM',
      labelTamil: 'மாலை 4-6',
      available: false // Example: Some slots might be busy
    },
    {
      id: '18:00-20:00',
      startTime: '18:00',
      endTime: '20:00',
      labelEnglish: '6:00-8:00 PM',
      labelTamil: 'மாலை 6-8',
      available: true
    }
  ];

  // Load existing booking data
  useEffect(() => {
    const savedData = sessionStorage.getItem('bookingData');
    if (savedData) {
      const data = JSON.parse(savedData);
      setBookingData(data);
      
      // If there's already selected schedule data, populate it
      if (data.scheduledDate) {
        setSelectedDate(new Date(data.scheduledDate));
      }
      if (data.timeSlot) {
        setSelectedTimeSlot(data.timeSlot);
      }
    }
  }, []);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    // Reset time slot selection when date changes
    setSelectedTimeSlot('');
  };

  const handleTimeSlotSelect = (slotId: string) => {
    setSelectedTimeSlot(slotId);
  };

  const formatDate = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    };
    
    if (language === 'ta') {
      // For Tamil, we'll use English numbers but Tamil month names could be added
      return date.toLocaleDateString('en-IN', options);
    }
    
    return date.toLocaleDateString('en-US', options);
  };

  const getSelectedSlot = (): TimeSlot | undefined => {
    return timeSlots.find(slot => slot.id === selectedTimeSlot);
  };

  const handleNext = () => {
    if (!selectedTimeSlot) {
      alert(language === 'ta' 
        ? 'நேரம் தேர்ந்தெடுக்கவும்'
        : 'Please select a time slot'
      );
      return;
    }

    // Create scheduled datetime
    const scheduledDateTime = new Date(selectedDate);
    const selectedSlot = getSelectedSlot();
    if (selectedSlot) {
      const [hours, minutes] = selectedSlot.startTime.split(':');
      scheduledDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    }

    // Save to session storage
    const updatedData = {
      ...bookingData,
      scheduledDate: scheduledDateTime.toISOString(),
      timeSlot: selectedTimeSlot,
      timeSlotLabel: {
        english: selectedSlot?.labelEnglish,
        tamil: selectedSlot?.labelTamil
      }
    };
    
    sessionStorage.setItem('bookingData', JSON.stringify(updatedData));
    router.push('/summary');
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isTomorrow = (date: Date): boolean => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return date.toDateString() === tomorrow.toDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="max-w-2xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pt-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center gap-2"
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
            {language === 'ta' ? 'எப்போது வேண்டும்?' : 'When needed?'}
          </h1>
          <p className={`text-lg text-gray-600 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
            {language === 'ta' 
              ? 'உங்களுக்கு வசதியான நேரத்தை தேர்ந்தெடுக்கவும்'
              : 'Choose a convenient time for you'
            }
          </p>
        </div>

        {/* Date Selection */}
        <Card className="mb-6">
          <div className="p-6">
            <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
              <Calendar className="w-5 h-5" />
              {language === 'ta' ? 'தேதி தேர்வு' : 'Select Date'}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {dateOptions.map((dateOption, index) => {
                const isSelected = selectedDate.toDateString() === dateOption.date.toDateString();
                return (
                  <Button
                    key={index}
                    variant={isSelected ? "default" : "outline"}
                    onClick={() => handleDateSelect(dateOption.date)}
                    className={`h-auto p-4 flex flex-col items-center ${
                      !dateOption.available ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    disabled={!dateOption.available}
                  >
                    <div className={`text-sm font-medium ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
                      {language === 'ta' ? dateOption.dayLabel.tamil : dateOption.dayLabel.english}
                    </div>
                    <div className="text-xs mt-1">
                      {formatDate(dateOption.date)}
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Time Slot Selection */}
        <Card className="mb-6">
          <div className="p-6">
            <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
              <Clock className="w-5 h-5" />
              {language === 'ta' ? 'நேரம் தேர்வு' : 'Select Time'}
            </h3>
            <div className="text-sm text-gray-600 mb-4">
              <span className={language === 'ta' ? 'font-tamil' : 'font-english'}>
                {language === 'ta' ? 'தேதி: ' : 'Date: '}
              </span>
              <span className="font-medium">
                {formatDate(selectedDate)} 
                {isToday(selectedDate) && (
                  <span className={`ml-2 text-green-600 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
                    ({language === 'ta' ? 'இன்று' : 'Today'})
                  </span>
                )}
                {isTomorrow(selectedDate) && (
                  <span className={`ml-2 text-blue-600 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
                    ({language === 'ta' ? 'நாளை' : 'Tomorrow'})
                  </span>
                )}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {timeSlots.map((slot) => {
                const isSelected = selectedTimeSlot === slot.id;
                return (
                  <Button
                    key={slot.id}
                    variant={isSelected ? "default" : "outline"}
                    onClick={() => handleTimeSlotSelect(slot.id)}
                    className={`h-auto p-4 flex flex-col items-center ${
                      !slot.available ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    disabled={!slot.available}
                  >
                    <div className={`text-sm font-bold ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
                      {language === 'ta' ? slot.labelTamil : slot.labelEnglish}
                    </div>
                    <div className={`text-xs mt-1 ${
                      slot.available 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {slot.available 
                        ? (language === 'ta' ? 'கிடைக்கிறது' : 'Available')
                        : (language === 'ta' ? 'பிசி' : 'Busy')
                      }
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Emergency Service Note */}
        {bookingData?.priority === 'emergency' && (
          <Card className="mb-6 bg-red-50 border-red-200">
            <div className="p-4">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="w-5 h-5" />
                <span className={`font-bold ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
                  {language === 'ta' ? 'அவசர சேவை' : 'Emergency Service'}
                </span>
              </div>
              <p className={`text-sm text-red-600 mt-2 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
                {language === 'ta' 
                  ? 'அவசர சேவைக்கு எங்கள் குழு 30 நிமிடத்திற்குள் வரும்'
                  : 'For emergency service, our team will arrive within 30 minutes'
                }
              </p>
            </div>
          </Card>
        )}

        {/* Service Hours Info */}
        <Card className="mb-8 bg-gray-50">
          <div className="p-4">
            <h4 className={`font-bold mb-2 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
              {language === 'ta' ? 'சேவை நேரம்' : 'Service Hours'}
            </h4>
            <div className="text-sm text-gray-600 space-y-1">
              <div className={language === 'ta' ? 'font-tamil' : 'font-english'}>
                <span className="font-medium">
                  {language === 'ta' ? 'வழக்கமான சேவை: ' : 'Regular Service: '}
                </span>
                {language === 'ta' ? 'காலை 8:00 - மாலை 8:00' : '8:00 AM - 8:00 PM'}
              </div>
              <div className={language === 'ta' ? 'font-tamil' : 'font-english'}>
                <span className="font-medium text-red-600">
                  {language === 'ta' ? 'அவசர சேவை: ' : 'Emergency Service: '}
                </span>
                {language === 'ta' ? '24 மணி நேரம்' : '24 Hours Available'}
              </div>
            </div>
          </div>
        </Card>

        {/* Next Button */}
        <Button
          onClick={handleNext}
          size="lg"
          className="w-full"
          disabled={!selectedTimeSlot}
        >
          <span className={`text-lg font-bold ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
            {language === 'ta' ? 'அடுத்து: விபரங்களை பார் →' : 'Next: Review Details →'}
          </span>
        </Button>

        {/* Book Tomorrow Option */}
        {!timeSlots.some(slot => slot.available) && (
          <div className="mt-4 text-center">
            <p className={`text-gray-600 mb-3 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
              {language === 'ta' 
                ? 'இன்று அனைத்து நேரங்களும் பிசி'
                : 'All slots busy today'
              }
            </p>
            <Button
              variant="outline"
              onClick={() => {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                handleDateSelect(tomorrow);
              }}
              className="w-full"
            >
              <Calendar className="w-4 h-4 mr-2" />
              <span className={language === 'ta' ? 'font-tamil' : 'font-english'}>
                {language === 'ta' ? 'நாளை பதிவு செய்க' : 'Book Tomorrow'}
              </span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};