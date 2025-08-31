// apps/frontend/src/components/customer/MyBookings.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../stores/auth-store';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { ArrowLeft, Star, Phone, MessageCircle, Calendar, MapPin, Clock, Wrench, AlertCircle, Plus } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/api';

type BookingStatus = 'pending' | 'confirmed' | 'assigned' | 'in-progress' | 'completed' | 'cancelled';
type ServiceType = 'electrical' | 'plumbing';
type Priority = 'normal' | 'urgent' | 'emergency';

interface Booking {
  id: number;
  bookingNumber: string;
  serviceType: ServiceType;
  priority: Priority;
  description: string;
  contactInfo: {
    name: string;
    phone: string;
    address: string;
  };
  scheduledTime: string;
  status: BookingStatus;
  totalCost: string;
  photos?: string[];
  createdAt: string;
  updatedAt: string;
  assignedTeam?: {
    name: string;
    phone: string;
    rating: number;
  };
  rating?: number;
  review?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
}

interface RatingData {
  rating: number;
  review: string;
}

export const MyBookings: React.FC = () => {
  const router = useRouter();
  const { language, user, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  
  const [selectedFilter, setSelectedFilter] = useState<'all' | BookingStatus>('all');
  const [showRatingModal, setShowRatingModal] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
  }, [isAuthenticated, router]);

  // Fetch bookings from backend
  const { data: bookings = [], isLoading, error, refetch } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: async () => {
      const response = await apiClient.get('/api/bookings/my');
      return response.bookings as Booking[];
    },
    enabled: isAuthenticated,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Rate service mutation
  const rateServiceMutation = useMutation({
    mutationFn: async ({ bookingId, rating, review }: { bookingId: string, rating: number, review: string }) => {
      return await apiClient.post(`/api/bookings/${bookingId}/rating`, { rating, review });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      setShowRatingModal(null);
      alert(language === 'ta' ? 'மதிப்பீடு சேமிக்கப்பட்டது!' : 'Rating saved successfully!');
    },
    onError: (error: any) => {
      alert(language === 'ta' ? 'மதிப்பீடு சேமிக்க முடியவில்லை!' : 'Failed to save rating!');
    },
  });

  // Cancel booking mutation
  const cancelBookingMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      return await apiClient.post(`/api/bookings/${bookingId}/cancel`, { 
        reason: 'Cancelled by customer' 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      alert(language === 'ta' ? 'பதிவு இரத்து செய்யப்பட்டது!' : 'Booking cancelled successfully!');
    },
    onError: (error: any) => {
      alert(language === 'ta' ? 'பதிவு இரத்து செய்ய முடியவில்லை!' : 'Failed to cancel booking!');
    },
  });

  const getStatusColor = (status: BookingStatus): string => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'assigned': return 'bg-purple-100 text-purple-800 border-purple-300';
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

  const formatScheduledTime = (scheduledTime: string): string => {
    const date = new Date(scheduledTime);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    let dateLabel = '';
    if (date.toDateString() === today.toDateString()) {
      dateLabel = language === 'ta' ? 'இன்று' : 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      dateLabel = language === 'ta' ? 'நாளை' : 'Tomorrow';
    } else {
      dateLabel = date.toLocaleDateString();
    }

    const timeLabel = date.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    return `${dateLabel} ${timeLabel}`;
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

  const handleCancelBooking = (bookingId: string, status: BookingStatus) => {
    if (status === 'completed' || status === 'cancelled') {
      return;
    }

    const confirmMessage = language === 'ta' 
      ? 'இந்த பதிவை இரத்து செய்ய வேண்டுமா?'
      : 'Are you sure you want to cancel this booking?';
    
    if (confirm(confirmMessage)) {
      cancelBookingMutation.mutate(bookingId);
    }
  };

  const handleRateService = (bookingId: string, rating: number, review: string) => {
    rateServiceMutation.mutate({ bookingId, rating, review });
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

  const RatingModal = ({ bookingId }: { bookingId: string }) => {
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState('');

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-md">
          <div className="p-6">
            <h3 className="text-lg font-bold mb-4">
              {language === 'ta' ? 'சேவையை மதிப்பிடுங்கள்' : 'Rate Our Service'}
            </h3>
            
            <div className="mb-4">
              <p className="text-sm mb-2">
                {language === 'ta' ? 'மதிப்பீடு:' : 'Rating:'}
              </p>
              <div className="flex gap-1">
                {Array.from({ length: 5 }, (_, index) => (
                  <Star
                    key={index}
                    className={`w-8 h-8 cursor-pointer ${
                      index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                    }`}
                    onClick={() => setRating(index + 1)}
                  />
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                {language === 'ta' ? 'கருத்து (விருப்பம்):' : 'Review (Optional):'}
              </label>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder={language === 'ta' ? 'உங்கள் அனுபவத்தை பகிருங்கள்...' : 'Share your experience...'}
                className="w-full p-3 border border-gray-300 rounded-lg"
                rows={3}
                maxLength={200}
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowRatingModal(null)}
                className="flex-1"
              >
                {language === 'ta' ? 'ரத்து' : 'Cancel'}
              </Button>
              <Button
                onClick={() => handleRateService(bookingId, rating, review)}
                disabled={rating === 0 || rateServiceMutation.isPending}
                className="flex-1"
              >
                {rateServiceMutation.isPending 
                  ? (language === 'ta' ? 'சேமிக்கிறது...' : 'Saving...')
                  : (language === 'ta' ? 'சேமி' : 'Submit')
                }
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const BookingCard = ({ booking }: { booking: Booking }) => (
    <Card className="mb-4 hover:shadow-md transition-shadow">
      <div className="p-4">
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
              <span>{getServiceTitle(booking.serviceType)}</span>
              <span>•</span>
              <span>{formatDate(booking.createdAt)}</span>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
            {getStatusText(booking.status)}
          </div>
        </div>

        <p className="text-gray-800 mb-3">{booking.description}</p>

        <div className="space-y-2 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>{booking.contactInfo.address}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{formatScheduledTime(booking.scheduledTime)}</span>
          </div>
          {booking.totalCost && (
            <div className="flex items-center gap-2">
              <span className="font-medium">Cost: ₹{booking.totalCost}</span>
            </div>
          )}
        </div>

        {booking.assignedTeam && (
          <div className="bg-gray-50 rounded-lg p-3 mb-3">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">{booking.assignedTeam.name}</p>
                <div className="flex items-center gap-1 text-sm">
                  {renderRatingStars(Math.floor(booking.assignedTeam.rating))}
                  <span className="ml-1">{booking.assignedTeam.rating}</span>
                </div>
              </div>
              {booking.status !== 'completed' && booking.status !== 'cancelled' && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handlePhoneCall(booking)}>
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleWhatsAppContact(booking)}>
                    <MessageCircle className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {booking.status === 'completed' && booking.rating && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium">
                {language === 'ta' ? 'உங்கள் மதிப்பீடு:' : 'Your Rating:'}
              </span>
              <div className="flex gap-1">
                {renderRatingStars(booking.rating)}
              </div>
            </div>
            {booking.review && (
              <p className="text-sm text-green-800">"{booking.review}"</p>
            )}
          </div>
        )}

        {booking.status === 'cancelled' && booking.cancellationReason && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-800">
              {language === 'ta' ? 'இரத்து காரணம்:' : 'Cancellation Reason:'} {booking.cancellationReason}
            </p>
          </div>
        )}

        <div className="flex gap-2 pt-3 border-t">
          {booking.status === 'completed' && !booking.rating && (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => setShowRatingModal(booking.bookingNumber)}
              >
                {language === 'ta' ? 'மதிப்பீடு கொடு' : 'Rate Service'}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => router.push(`/services?repeat=${booking.bookingNumber}`)}
              >
                {language === 'ta' ? 'மீண்டும் பதிவு' : 'Book Again'}
              </Button>
            </>
          )}
          
          {(booking.status === 'pending' || booking.status === 'confirmed') && (
            <Button 
              variant="outline" 
              size="sm" 
              className="text-red-600 hover:text-red-700"
              onClick={() => handleCancelBooking(booking.bookingNumber, booking.status)}
              disabled={cancelBookingMutation.isPending}
            >
              {cancelBookingMutation.isPending 
                ? (language === 'ta' ? 'இரத்து செய்கிறது...' : 'Cancelling...')
                : (language === 'ta' ? 'இரத்து செய்' : 'Cancel')
              }
            </Button>
          )}
        </div>
      </div>
    </Card>
  );

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p>{language === 'ta' ? 'ஏற்றுகிறது...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            {language === 'ta' ? 'பதிவுகளை ஏற்ற முடியவில்லை' : 'Failed to load bookings'}
          </p>
          <Button onClick={() => refetch()}>
            {language === 'ta' ? 'மீண்டும் முயற்சி' : 'Try Again'}
          </Button>
        </div>
      </div>
    );
  }

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
            {language === 'ta' ? 'எனது பதிவுகள்' : 'My Bookings'}
          </h1>
          <p className="text-lg text-gray-600">
            {language === 'ta' 
              ? 'உங்கள் சேவை பதிவுகளை பார்க்கவும்'
              : 'Track your service bookings'
            }
          </p>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto">
          {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((filter) => (
            <Button
              key={filter}
              variant={selectedFilter === filter ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFilter(filter as typeof selectedFilter)}
              className="whitespace-nowrap"
            >
              {filter === 'all' 
                ? (language === 'ta' ? 'அனைத்தும்' : 'All')
                : getStatusText(filter as BookingStatus)
              }
            </Button>
          ))}
        </div>

        {filteredBookings.length === 0 ? (
          <Card className="p-8 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              {language === 'ta' ? 'பதிவுகள் இல்லை' : 'No bookings found'}
            </p>
            <Button onClick={() => router.push('/services')}>
              <Plus className="w-4 h-4 mr-2" />
              <span>{language === 'ta' ? 'புதிய பதிவு' : 'New Booking'}</span>
            </Button>
          </Card>
        ) : (
          <div>
            {filteredBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        )}

        {filteredBookings.length > 0 && (
          <div className="text-center mt-8">
            <Button onClick={() => router.push('/services')} size="lg" className="w-full">
              <Plus className="w-5 h-5 mr-2" />
              <span className="text-lg font-bold">
                {language === 'ta' ? 'புதிய சேவை பதிவு' : 'Book New Service'}
              </span>
            </Button>
          </div>
        )}

        {/* Rating Modal */}
        {showRatingModal && (
          <RatingModal bookingId={showRatingModal} />
        )}
      </div>
    </div>
  );
};

export default MyBookings;