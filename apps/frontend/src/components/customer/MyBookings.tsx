// apps/frontend/src/components/customer/MyBookings.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../stores/auth-store';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { ArrowLeft, Star, Phone, MessageCircle, Calendar, MapPin, Clock, Wrench, AlertCircle, Plus } from 'lucide-react';
import type { BookingStatus, ServiceType } from '../../types';
export type Priority = 'normal' | 'urgent' | 'emergency';
interface Booking {
  id: string;
  bookingNumber: string;
  serviceType: ServiceType;
  priority: Priority;
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
  status: BookingStatus;
  cost?: number;
  rating?: number;
  review?: string;
  assignedTeam?: {
    name: string;
    phone: string;
    rating: number;
  };
  createdAt: string;
  completedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
}

export const MyBookings: React.FC = () => {
  const router = useRouter();
  const { language, user } = useAuthStore();
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'all' | BookingStatus>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Mock data - In real app, this would be an API call
  const mockBookings: Booking[] = [
    {
      id: '1',
      bookingNumber: 'NMS001',
      serviceType: 'electrical',
      priority: 'normal',
      description: 'விசிறி ஓடவில்லை, சத்தம் வருகிறது',
      contactInfo: {
        name: 'ராஜேஷ் குமார்',
        phone: '9876543210',
        address: '123, காந்தி சாலை, நாகர்கோயில்'
      },
      scheduledDate: new Date().toISOString(),
      timeSlotLabel: {
        english: '2:00-4:00 PM',
        tamil: 'மதியம் 2-4'
      },
      status: 'confirmed',
      cost: 350,
      assignedTeam: {
        name: 'Team A - முருகன்',
        phone: '9876543299',
        rating: 4.8
      },
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      bookingNumber: 'NMS002',
      serviceType: 'plumbing',
      priority: 'normal',
      description: 'குழாய் லீக்கேஜ், தண்ணீர் கசிவு',
      contactInfo: {
        name: 'சுரேஷ்',
        phone: '9876543211',
        address: '456, கடற்கரை சாலை, கன்யாகுமரி'
      },
      scheduledDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      timeSlotLabel: {
        english: '10:00 AM-12:00 PM',
        tamil: 'காலை 10-12'
      },
      status: 'completed',
      cost: 400,
      rating: 5,
      review: 'சிறந்த சேவை! விரைவாக வந்து சரி செய்தார்கள்',
      assignedTeam: {
        name: 'Team B - ராமன்',
        phone: '9876543288',
        rating: 4.2
      },
      createdAt: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
      completedAt: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '3',
      bookingNumber: 'NMS003',
      serviceType: 'electrical',
      priority: 'emergency',
      description: 'அவசரம் பவர் கட், முழு வீட்டிலும் மின்சாரம் இல்லை',
      contactInfo: {
        name: 'மாலதி',
        phone: '9876543212',
        address: '789, மார்க்கெட் ஸ்ட்ரீட், மார்த்தாண்டம்'
      },
      scheduledDate: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      timeSlotLabel: {
        english: 'Immediate',
        tamil: 'உடனடி'
      },
      status: 'cancelled',
      cancelledAt: new Date(Date.now() - 47 * 60 * 60 * 1000).toISOString(),
      cancellationReason: 'Problem resolved by customer',
      createdAt: new Date(Date.now() - 49 * 60 * 60 * 1000).toISOString()
    }
  ];

  useEffect(() => {
    // Simulate API call
    const loadBookings = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setBookings(mockBookings);
      setIsLoading(false);
    };

    loadBookings();
  }, []);

  const getStatusColor = (status: BookingStatus): string => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-300';
      
      case 'in-progress': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'completed': return 'bg-green-100 text-green-800 border-green-300';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusText = (status: BookingStatus): string => {
    const statusMap = {
      pending: { ta: 'காத்திருக்கும்', en: 'Pending' },
      confirmed: { ta: 'உறுதி', en: 'Confirmed' },
      assigned: { ta: 'ஒதுக்கப்பட்டது', en: 'Assigned' },
      'in-progress': { ta: 'நடந்து கொண்டிருக்கிறது', en: 'In Progress' },
      completed: { ta: 'முடிந்தது', en: 'Completed' },
      cancelled: { ta: 'இரத்து', en: 'Cancelled' }
    };

    return language === 'ta' ? statusMap[status].ta : statusMap[status].en;
  };

  const getServiceTitle = (serviceType: ServiceType): string => {
    return serviceType === 'electrical' 
      ? (language === 'ta' ? 'மின்சாரம்' : 'Electrical')
      : (language === 'ta' ? 'குழாய்' : 'Plumbing');
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 24) {
      if (diffInHours < 1) {
        return language === 'ta' ? 'இப்போது' : 'Just now';
      }
      return language === 'ta' ? `${diffInHours} மணி முன்` : `${diffInHours}h ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) {
      return language === 'ta' ? 'நேற்று' : 'Yesterday';
    } else if (diffInDays < 7) {
      return language === 'ta' ? `${diffInDays} நாள் முன்` : `${diffInDays}d ago`;
    }

    return date.toLocaleDateString(language === 'ta' ? 'en-IN' : 'en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredBookings = selectedFilter === 'all' 
    ? bookings 
    : bookings.filter(booking => booking.status === selectedFilter);

  const handleWhatsAppContact = (booking: Booking) => {
    const message = language === 'ta'
      ? `பதிவு எண்: ${booking.bookingNumber}\nசேவை: ${getServiceTitle(booking.serviceType)}\nநிலை: ${getStatusText(booking.status)}\nதகவல் தேவை`
      : `Booking ID: ${booking.bookingNumber}\nService: ${getServiceTitle(booking.serviceType)}\nStatus: ${getStatusText(booking.status)}\nNeed updates`;
    
    const phone = booking.assignedTeam?.phone || '919876500000';
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handlePhoneCall = (booking: Booking) => {
    const phone = booking.assignedTeam?.phone || '+919876500000';
    window.open(`tel:${phone}`, '_self');
  };

  const renderRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const BookingCard = ({ booking }: { booking: Booking }) => (
    <Card className="mb-4 hover:shadow-md transition-shadow">
      <div className="p-4">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-lg">#{booking.bookingNumber}</span>
              {booking.priority === 'emergency' && (
                <AlertCircle className="w-4 h-4 text-red-500" />
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Wrench className="w-4 h-4" />
              <span className={language === 'ta' ? 'font-tamil' : 'font-english'}>
                {getServiceTitle(booking.serviceType)}
              </span>
              <span>•</span>
              <span>{formatDate(booking.createdAt)}</span>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
            {getStatusText(booking.status)}
          </div>
        </div>

        {/* Description */}
        <p className={`text-gray-800 mb-3 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
          {booking.description}
        </p>

        {/* Details */}
        <div className="space-y-2 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span className={language === 'ta' ? 'font-tamil' : 'font-english'}>
              {booking.contactInfo.address}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span className={language === 'ta' ? 'font-tamil' : 'font-english'}>
              {language === 'ta' ? booking.timeSlotLabel.tamil : booking.timeSlotLabel.english}
            </span>
          </div>
          {booking.cost && (
            <div className="flex items-center gap-2">
              <span className="font-medium">Cost: ₹{booking.cost}</span>
            </div>
          )}
        </div>

        {/* Team Info */}
        {booking.assignedTeam && (
          <div className="bg-gray-50 rounded-lg p-3 mb-3">
            <div className="flex justify-between items-center">
              <div>
                <p className={`font-medium ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
                  {booking.assignedTeam.name}
                </p>
                <div className="flex items-center gap-1 text-sm">
                  {renderRatingStars(Math.floor(booking.assignedTeam.rating))}
                  <span className="ml-1">{booking.assignedTeam.rating}</span>
                </div>
              </div>
              {booking.status !== 'completed' && booking.status !== 'cancelled' && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePhoneCall(booking)}
                  >
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleWhatsAppContact(booking)}
                  >
                    <MessageCircle className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Rating & Review */}
        {booking.status === 'completed' && booking.rating && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-sm font-medium ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
                {language === 'ta' ? 'உங்கள் மதிப்பீடு:' : 'Your Rating:'}
              </span>
              <div className="flex gap-1">
                {renderRatingStars(booking.rating)}
              </div>
            </div>
            {booking.review && (
              <p className={`text-sm text-green-800 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
                "{booking.review}"
              </p>
            )}
          </div>
        )}

        {/* Cancellation Reason */}
        {booking.status === 'cancelled' && booking.cancellationReason && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className={`text-sm text-red-800 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
              {language === 'ta' ? 'இரத்து காரணம்:' : 'Cancellation Reason:'} {booking.cancellationReason}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        {booking.status === 'completed' && !booking.rating && (
          <div className="flex gap-2 pt-3 border-t">
            <Button variant="outline" size="sm" className="flex-1">
              <span className={language === 'ta' ? 'font-tamil' : 'font-english'}>
                {language === 'ta' ? 'மதிப்பீடு கொடு' : 'Rate Service'}
              </span>
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <span className={language === 'ta' ? 'font-tamil' : 'font-english'}>
                {language === 'ta' ? 'மீண்டும் பதிவு' : 'Book Again'}
              </span>
            </Button>
          </div>
        )}
      </div>
    </Card>
  );

  if (isLoading) {
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
            {language === 'ta' ? 'எனது பதிவுகள்' : 'My Bookings'}
          </h1>
          <p className={`text-lg text-gray-600 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
            {language === 'ta' 
              ? 'உங்கள் சேவை பதிவுகளை பார்க்கவும்'
              : 'Track your service bookings'
            }
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((filter) => (
            <Button
              key={filter}
              variant={selectedFilter === filter ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFilter(filter as typeof selectedFilter)}
              className="whitespace-nowrap"
            >
              <span className={language === 'ta' ? 'font-tamil' : 'font-english'}>
                {filter === 'all' 
                  ? (language === 'ta' ? 'அனைத்தும்' : 'All')
                  : getStatusText(filter as BookingStatus)
                }
              </span>
            </Button>
          ))}
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <Card className="p-8 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className={`text-gray-600 mb-4 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
              {language === 'ta' 
                ? 'பதிவுகள் இல்லை'
                : 'No bookings found'
              }
            </p>
            <Button onClick={() => router.push('/services')}>
              <Plus className="w-4 h-4 mr-2" />
              <span className={language === 'ta' ? 'font-tamil' : 'font-english'}>
                {language === 'ta' ? 'புதிய பதிவு' : 'New Booking'}
              </span>
            </Button>
          </Card>
        ) : (
          <div>
            {filteredBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        )}

        {/* New Booking Button */}
        {filteredBookings.length > 0 && (
          <div className="text-center mt-8">
            <Button
              onClick={() => router.push('/services')}
              size="lg"
              className="w-full"
            >
              <Plus className="w-5 h-5 mr-2" />
              <span className={`text-lg font-bold ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
                {language === 'ta' ? 'புதிய சேவை பதிவு' : 'Book New Service'}
              </span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
export default MyBookings;
