// apps/frontend/src/components/dashboard/CustomerDashboard.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Phone, 
  MessageCircle,
  Star,
  Calendar,
  MapPin,
  User,
  Settings,
  Package,
  Repeat,
  Plus,
  Zap,
  Droplets,
  Eye,
  ShoppingCart,
  Globe,
  Bell
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { StatusBadge } from '../ui/status-badge';
import { useAuthStore } from '../../stores/auth-store';
import { useBookingStore } from '../../stores/booking-store';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Booking {
  id: string;
  title: string;
  serviceType: 'electrical' | 'plumbing';
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'normal' | 'urgent' | 'emergency';
  scheduledTime: string;
  completedAt?: string;
  technicianName?: string;
  technicianPhone?: string;
  rating?: number;
  review?: string;
  estimatedCost?: number;
  actualCost?: number;
  contactInfo: {
    address: string;
  };
  createdAt: string;
}

interface Product {
  id: string;
  nameEn: string;
  nameTa: string;
  category: string;
  price: number;
  discountedPrice?: number;
  images: string[];
  stockQuantity: number;
  isActive: boolean;
  isFeatured: boolean;
}

interface UserProfile {
  id: string;
  name: string;
  phone: string;
  address: string;
  language: 'ta' | 'en';
  totalBookings: number;
  completedBookings: number;
  averageRating: number;
}

const CustomerDashboard: React.FC = () => {
  const router = useRouter();
  const { user, language, setLanguage } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'bookings' | 'history' | 'products' | 'profile'>('bookings');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const queryClient = useQueryClient();

  // Mock API calls - in real app, these would be actual API endpoints
  const { data: activeBookings = [], isLoading: loadingActive } = useQuery({
    queryKey: ['active-bookings'],
    queryFn: async (): Promise<Booking[]> => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return [
        {
          id: 'BK001',
          title: language === 'ta' ? 'விசிறி பழுது' : 'Fan Repair',
          serviceType: 'electrical',
          status: 'confirmed',
          priority: 'normal',
          scheduledTime: '2024-12-15T14:00:00',
          technicianName: 'முருகன் குமார்',
          technicianPhone: '9876543210',
          estimatedCost: 200,
          contactInfo: { address: '123, காந்தி சாலை, நாகர்கோயில்' },
          createdAt: '2024-12-14T10:30:00'
        },
        {
          id: 'BK002',
          title: language === 'ta' ? 'குழாய் கசிவு' : 'Pipe Leakage',
          serviceType: 'plumbing',
          status: 'in-progress',
          priority: 'urgent',
          scheduledTime: '2024-12-15T09:00:00',
          technicianName: 'ராமன் செல்வம்',
          technicianPhone: '9876543220',
          estimatedCost: 300,
          contactInfo: { address: '123, காந்தி சாலை, நாகர்கோயில்' },
          createdAt: '2024-12-14T08:15:00'
        }
      ];
    }
  });

  const { data: bookingHistory = [], isLoading: loadingHistory } = useQuery({
    queryKey: ['booking-history'],
    queryFn: async (): Promise<Booking[]> => {
      await new Promise(resolve => setTimeout(resolve, 800));
      return [
        {
          id: 'BK003',
          title: language === 'ta' ? 'சுவிட்ச் மாற்று' : 'Switch Replacement',
          serviceType: 'electrical',
          status: 'completed',
          priority: 'normal',
          scheduledTime: '2024-12-10T15:00:00',
          completedAt: '2024-12-10T16:30:00',
          technicianName: 'கிருஷ்ணன் ராஜ்',
          technicianPhone: '9876543230',
          actualCost: 180,
          rating: 5,
          review: language === 'ta' ? 'சிறந்த சேவை!' : 'Excellent service!',
          contactInfo: { address: '123, காந்தி சாலை, நாகர்கோயில்' },
          createdAt: '2024-12-09T11:20:00'
        },
        {
          id: 'BK004',
          title: language === 'ta' ? 'கழிப்பறை பழுது' : 'Toilet Repair',
          serviceType: 'plumbing',
          status: 'completed',
          priority: 'normal',
          scheduledTime: '2024-12-05T10:00:00',
          completedAt: '2024-12-05T11:45:00',
          technicianName: 'ராமன் செல்வம்',
          technicianPhone: '9876543220',
          actualCost: 250,
          rating: 4,
          review: language === 'ta' ? 'நல்ல வேலை' : 'Good work',
          contactInfo: { address: '123, காந்தி சாலை, நாகர்கோயில்' },
          createdAt: '2024-12-04T14:10:00'
        }
      ];
    }
  });

  const { data: featuredProducts = [], isLoading: loadingProducts } = useQuery({
    queryKey: ['featured-products'],
    queryFn: async (): Promise<Product[]> => {
      await new Promise(resolve => setTimeout(resolve, 600));
      return [
        {
          id: 'PRD001',
          nameEn: 'LED Bulb 9W',
          nameTa: 'LED பல்ப் 9W',
          category: 'electrical-fixtures',
          price: 150,
          discountedPrice: 120,
          images: ['/images/led-bulb.jpg'],
          stockQuantity: 50,
          isActive: true,
          isFeatured: true
        },
        {
          id: 'PRD002',
          nameEn: 'Ceiling Fan 48"',
          nameTa: 'உச்சவர விசிறி 48"',
          category: 'electrical-fans',
          price: 2200,
          images: ['/images/ceiling-fan.jpg'],
          stockQuantity: 15,
          isActive: true,
          isFeatured: true
        },
        {
          id: 'PRD003',
          nameEn: 'PVC Pipe 1/2"',
          nameTa: 'PVC குழாய் 1/2"',
          category: 'plumbing-pipes',
          price: 60,
          images: ['/images/pvc-pipe.jpg'],
          stockQuantity: 100,
          isActive: true,
          isFeatured: true
        }
      ];
    }
  });

  const { data: userProfile } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async (): Promise<UserProfile> => {
      await new Promise(resolve => setTimeout(resolve, 400));
      return {
        id: user?.id || '1',
        name: user?.name || 'ராஜேஷ் குமார்',
        phone: user?.phone || '9876543210',
        address: user?.address || '123, காந்தி சாலை, நாகர்கோயில் - 629001',
        language: language,
        totalBookings: 6,
        completedBookings: 4,
        averageRating: 4.5
      };
    }
  });

  const handleWhatsAppContact = (phone: string, bookingId?: string) => {
    const message = bookingId 
      ? (language === 'ta' 
          ? `வணக்கம்! பதிவு எண் ${bookingId} பற்றி தெரிந்துகொள்ள வேண்டும்.`
          : `Hello! I need information about booking ${bookingId}.`)
      : (language === 'ta'
          ? 'வணக்கம்! சேவை பற்றி கேட்க வேண்டும்.'
          : 'Hello! I need to ask about service.');
    
    const whatsappUrl = `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleEmergencyCall = () => {
    window.open('tel:+919876500000', '_self');
  };

  const handleQuickRebook = (booking: Booking) => {
    router.push(`/book?service=${booking.serviceType}&type=${booking.title}`);
  };

  const renderStatusBadge = (status: Booking['status'], priority: Booking['priority']) => {
    if (priority === 'emergency') {
      return (
        <StatusBadge variant="emergency" className="animate-pulse">
          🚨 {language === 'ta' ? 'அவசரம்' : 'Emergency'}
        </StatusBadge>
      );
    }

    const statusMap = {
      pending: {
        variant: 'pending' as const,
        label: language === 'ta' ? 'காத்திருக்கும்' : 'Pending'
      },
      confirmed: {
        variant: 'confirmed' as const,
        label: language === 'ta' ? 'உறுதிப்படுத்தப்பட்டது' : 'Confirmed'
      },
      'in-progress': {
        variant: 'in-progress' as const,
        label: language === 'ta' ? 'நடந்துகொண்டிருக்கிறது' : 'In Progress'
      },
      completed: {
        variant: 'completed' as const,
        label: language === 'ta' ? 'முடிந்தது' : 'Completed'
      },
      cancelled: {
        variant: 'cancelled' as const,
        label: language === 'ta' ? 'இரத்து' : 'Cancelled'
      }
    };

    const { variant, label } = statusMap[status];
    return <StatusBadge variant={variant}>{label}</StatusBadge>;
  };

  const renderActiveBookings = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className={`text-2xl font-bold ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
          {language === 'ta' ? 'நடப்பு பதிவுகள்' : 'Active Bookings'}
        </h3>
        <Button onClick={() => router.push('/book')} className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span className={language === 'ta' ? 'font-tamil' : 'font-english'}>
            {language === 'ta' ? 'புதிய பதிவு' : 'New Booking'}
          </span>
        </Button>
      </div>

      {loadingActive ? (
        <div className="space-y-4">
          {[1, 2].map(i => (
            <Card key={i} className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </Card>
          ))}
        </div>
      ) : activeBookings.length === 0 ? (
        <Card className="p-8 text-center">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className={`text-lg text-gray-600 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
            {language === 'ta' ? 'தற்போது எந்த பதிவும் இல்லை' : 'No active bookings'}
          </p>
          <Button onClick={() => router.push('/book')} className="mt-4">
            <span className={language === 'ta' ? 'font-tamil' : 'font-english'}>
              {language === 'ta' ? 'முதல் சேவை பதிவு செய்யுங்கள்' : 'Book your first service'}
            </span>
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {activeBookings.map((booking) => (
            <Card key={booking.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${
                      booking.serviceType === 'electrical' 
                        ? 'bg-electrical-100 text-electrical-600' 
                        : 'bg-plumbing-100 text-plumbing-600'
                    }`}>
                      {booking.serviceType === 'electrical' ? 
                        <Zap className="w-5 h-5" /> : 
                        <Droplets className="w-5 h-5" />
                      }
                    </div>
                    <div>
                      <h4 className={`text-lg font-bold ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
                        {booking.title}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {language === 'ta' ? 'பதிவு எண்:' : 'Booking ID:'} {booking.id}
                      </p>
                    </div>
                  </div>
                  {renderStatusBadge(booking.status, booking.priority)}
                </div>

                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    <span className="text-sm">
                      {new Date(booking.scheduledTime).toLocaleString(
                        language === 'ta' ? 'ta-IN' : 'en-IN',
                        { 
                          day: 'numeric', 
                          month: 'short', 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        }
                      )}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span className="text-sm">{booking.contactInfo.address}</span>
                  </div>
                </div>

                {booking.technicianName && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`font-medium ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
                          {language === 'ta' ? 'தொழிலாளர்:' : 'Technician:'} {booking.technicianName}
                        </p>
                        <p className="text-sm text-gray-600">{booking.technicianPhone}</p>
                      </div>
                      <Button
                        onClick={() => handleWhatsAppContact(booking.technicianPhone!, booking.id)}
                        variant="secondary"
                        size="sm"
                        className="bg-green-500 text-white hover:bg-green-600"
                      >
                        <MessageCircle className="w-4 h-4 mr-1" />
                        WhatsApp
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    {booking.estimatedCost && (
                      <span className="font-medium text-green-600">
                        {language === 'ta' ? 'மதிப்பிடப்பட்ட விலை:' : 'Estimated cost:'} ₹{booking.estimatedCost}
                      </span>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => setSelectedBooking(booking)}
                      variant="secondary"
                      size="sm"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      <span className={language === 'ta' ? 'font-tamil' : 'font-english'}>
                        {language === 'ta' ? 'பார்' : 'View'}
                      </span>
                    </Button>
                    {booking.status === 'completed' && (
                      <Button
                        onClick={() => handleQuickRebook(booking)}
                        variant="secondary"
                        size="sm"
                        className="text-primary-600"
                      >
                        <Repeat className="w-4 h-4 mr-1" />
                        <span className={language === 'ta' ? 'font-tamil' : 'font-english'}>
                          {language === 'ta' ? 'மீண்டும்' : 'Rebook'}
                        </span>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderBookingHistory = () => (
    <div className="space-y-4">
      <h3 className={`text-2xl font-bold ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
        {language === 'ta' ? 'சேவை வரலாறு' : 'Service History'}
      </h3>

      {loadingHistory ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {bookingHistory.map((booking) => (
            <Card key={booking.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${
                      booking.serviceType === 'electrical' 
                        ? 'bg-electrical-100 text-electrical-600' 
                        : 'bg-plumbing-100 text-plumbing-600'
                    }`}>
                      {booking.serviceType === 'electrical' ? 
                        <Zap className="w-5 h-5" /> : 
                        <Droplets className="w-5 h-5" />
                      }
                    </div>
                    <div>
                      <h4 className={`text-lg font-bold ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
                        {booking.title}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {new Date(booking.completedAt || booking.scheduledTime).toLocaleDateString(
                          language === 'ta' ? 'ta-IN' : 'en-IN',
                          { day: 'numeric', month: 'long', year: 'numeric' }
                        )}
                      </p>
                    </div>
                  </div>
                  {renderStatusBadge(booking.status, booking.priority)}
                </div>

                {booking.rating && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center mb-2">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= booking.rating! 
                                ? 'text-yellow-400 fill-current' 
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="ml-2 font-medium">{booking.rating}/5</span>
                    </div>
                    {booking.review && (
                      <p className={`text-sm italic ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
                        "{booking.review}"
                      </p>
                    )}
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <span className={`text-sm text-gray-600 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
                      {language === 'ta' ? 'தொழிலாளர்:' : 'Technician:'}
                    </span>
                    <p className="font-medium">{booking.technicianName}</p>
                  </div>
                  <div>
                    <span className={`text-sm text-gray-600 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
                      {language === 'ta' ? 'மொத்த கட்டணம்:' : 'Total cost:'}
                    </span>
                    <p className="font-medium text-green-600">₹{booking.actualCost}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Button
                    onClick={() => handleQuickRebook(booking)}
                    variant="secondary"
                    size="sm"
                    className="text-primary-600"
                  >
                    <Repeat className="w-4 h-4 mr-1" />
                    <span className={language === 'ta' ? 'font-tamil' : 'font-english'}>
                      {language === 'ta' ? 'மீண்டும் பதிவு' : 'Book Again'}
                    </span>
                  </Button>
                  <Button
                    onClick={() => handleWhatsAppContact(booking.technicianPhone!, booking.id)}
                    variant="secondary"
                    size="sm"
                    className="bg-green-500 text-white hover:bg-green-600"
                  >
                    <MessageCircle className="w-4 h-4 mr-1" />
                    <span className={language === 'ta' ? 'font-tamil' : 'font-english'}>
                      {language === 'ta' ? 'தொடர்பு கொள்' : 'Contact'}
                    </span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderProductCatalog = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className={`text-2xl font-bold ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
          {language === 'ta' ? 'பொருட்கள்' : 'Products'}
        </h3>
        <Button onClick={() => router.push('/products')} variant="secondary">
          <span className={language === 'ta' ? 'font-tamil' : 'font-english'}>
            {language === 'ta' ? 'அனைத்தும் பார்' : 'View All'}
          </span>
        </Button>
      </div>

      {loadingProducts ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="p-4">
              <div className="animate-pulse">
                <div className="h-32 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featuredProducts.map((product) => (
            <Card key={product.id} className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => router.push(`/products/${product.id}`)}>
              <CardContent className="p-4">
                <div className="bg-gray-100 rounded-lg h-32 mb-4 flex items-center justify-center">
                  <Package className="w-12 h-12 text-gray-400" />
                </div>
                <h4 className={`font-bold mb-2 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
                  {product[language === 'ta' ? 'nameTa' : 'nameEn']}
                </h4>
                <div className="flex items-center justify-between">
                  <div>
                    {product.discountedPrice ? (
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-green-600">₹{product.discountedPrice}</span>
                        <span className="text-sm text-gray-500 line-through">₹{product.price}</span>
                      </div>
                    ) : (
                      <span className="font-bold">₹{product.price}</span>
                    )}
                  </div>
                  <Button size="sm" variant="secondary">
                    <ShoppingCart className="w-4 h-4 mr-1" />
                    <span className={language === 'ta' ? 'font-tamil' : 'font-english'}>
                      {language === 'ta' ? 'கார்ட்' : 'Cart'}
                    </span>
                  </Button>
                </div>
                <div className="text-xs text-gray-600 mt-2">
                  {language === 'ta' ? 'கையிருப்பு:' : 'Stock:'} {product.stockQuantity}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-6">
      <h3 className={`text-2xl font-bold ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
        {language === 'ta' ? 'எனது விபரங்கள்' : 'My Profile'}
      </h3>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Profile Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className={`flex items-center ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
              <User className="w-5 h-5 mr-2" />
              {language === 'ta' ? 'தனிப்பட்ட விபரங்கள்' : 'Personal Information'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className={`text-sm font-medium text-gray-600 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
                {language === 'ta' ? 'முகவரி:' : 'Address:'}
              </label>
              <p className="font-medium">{userProfile?.address}</p>
            </div>
            <div className="pt-4 border-t">
              <Button variant="secondary" size="sm" onClick={() => router.push('/profile/edit')}>
                <Settings className="w-4 h-4 mr-2" />
                <span className={language === 'ta' ? 'font-tamil' : 'font-english'}>
                  {language === 'ta' ? 'திருத்து' : 'Edit Profile'}
                </span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle className={`flex items-center ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
              <Settings className="w-5 h-5 mr-2" />
              {language === 'ta' ? 'அமைப்புகள்' : 'Settings'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className={`font-medium ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
                  {language === 'ta' ? 'மொழி:' : 'Language:'}
                </label>
                <p className="text-sm text-gray-600">
                  {language === 'ta' ? 'தமிழ்' : 'English'}
                </p>
              </div>
              <Button
                onClick={() => setLanguage(language === 'ta' ? 'en' : 'ta')}
                variant="secondary"
                size="sm"
              >
                <Globe className="w-4 h-4 mr-2" />
                {language === 'ta' ? 'English' : 'தமிழ்'}
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className={`font-medium ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
                  {language === 'ta' ? 'அறிவிப்புகள்:' : 'Notifications:'}
                </label>
                <p className="text-sm text-gray-600">
                  {language === 'ta' ? 'SMS மற்றும் WhatsApp' : 'SMS and WhatsApp'}
                </p>
              </div>
              <Button variant="secondary" size="sm">
                <Bell className="w-4 h-4 mr-2" />
                <span className={language === 'ta' ? 'font-tamil' : 'font-english'}>
                  {language === 'ta' ? 'மாற்று' : 'Change'}
                </span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className={`flex items-center ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
              <Star className="w-5 h-5 mr-2" />
              {language === 'ta' ? 'சேவை புள்ளிவிவரங்கள்' : 'Service Statistics'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{userProfile?.totalBookings}</div>
                <p className={`text-sm text-gray-600 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
                  {language === 'ta' ? 'மொத்த பதிவுகள்' : 'Total Bookings'}
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{userProfile?.completedBookings}</div>
                <p className={`text-sm text-gray-600 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
                  {language === 'ta' ? 'முடிந்த சேவைகள்' : 'Completed Services'}
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600">
                  {userProfile?.averageRating}⭐
                </div>
                <p className={`text-sm text-gray-600 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
                  {language === 'ta' ? 'சராசரி மதிப்பீடு' : 'Average Rating'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'bookings': return renderActiveBookings();
      case 'history': return renderBookingHistory();
      case 'products': return renderProductCatalog();
      case 'profile': return renderProfile();
      default: return renderActiveBookings();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-2xl font-black ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
                {language === 'ta' ? 'எனது டாஷ்போர்டு' : 'My Dashboard'}
              </h1>
              <p className="text-gray-600">
                {language === 'ta' ? `வணக்கம், ${userProfile?.name}` : `Welcome, ${userProfile?.name}`}
              </p>
            </div>
            
            {/* Emergency Contact */}
            <div className="flex space-x-2">
              <Button
                onClick={handleEmergencyCall}
                variant="emergency"
                size="sm"
                className="animate-pulse"
              >
                <Phone className="w-4 h-4 mr-2" />
                <span className={language === 'ta' ? 'font-tamil' : 'font-english'}>
                  {language === 'ta' ? 'அவசரம்' : 'Emergency'}
                </span>
              </Button>
              <Button
                onClick={() => handleWhatsAppContact('9876500000')}
                variant="secondary"
                size="sm"
                className="bg-green-500 text-white hover:bg-green-600"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                WhatsApp
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex space-x-8">
            {[
              { id: 'bookings', label: language === 'ta' ? 'நடப்பு பதிவுகள்' : 'Active Bookings', icon: Clock },
              { id: 'history', label: language === 'ta' ? 'வரலாறு' : 'History', icon: CheckCircle },
              { id: 'products', label: language === 'ta' ? 'பொருட்கள்' : 'Products', icon: Package },
              { id: 'profile', label: language === 'ta' ? 'விபரங்கள்' : 'Profile', icon: User }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className={`font-medium ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {renderTabContent()}
      </main>

      {/* Quick Actions Floating Button */}
      <div className="fixed bottom-6 right-6">
        <div className="flex flex-col space-y-2">
          <Button
            onClick={() => router.push('/book')}
            className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl"
            title={language === 'ta' ? 'புதிய பதிவு' : 'New Booking'}
          >
            <Plus className="w-6 h-6" />
          </Button>
        </div>
      </div>

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className={language === 'ta' ? 'font-tamil' : 'font-english'}>
                {language === 'ta' ? 'பதிவு விபரங்கள்' : 'Booking Details'}
              </CardTitle>
              <Button
                onClick={() => setSelectedBooking(null)}
                variant="secondary"
                size="sm"
              >
                ✕
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className={`text-xl font-bold ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
                  {selectedBooking.title}
                </h3>
                {renderStatusBadge(selectedBooking.status, selectedBooking.priority)}
              </div>
              
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">{language === 'ta' ? 'பதিவு எண்:' : 'Booking ID:'}</span>
                  <p>{selectedBooking.id}</p>
                </div>
                <div>
                  <span className="font-medium">{language === 'ta' ? 'சேவை வகை:' : 'Service Type:'}</span>
                  <p className="capitalize">{selectedBooking.serviceType}</p>
                </div>
                <div>
                  <span className="font-medium">{language === 'ta' ? 'திட்டமிடப்பட்ட நேரம்:' : 'Scheduled Time:'}</span>
                  <p>{new Date(selectedBooking.scheduledTime).toLocaleString()}</p>
                </div>
                <div>
                  <span className="font-medium">{language === 'ta' ? 'முன்னுரிமை:' : 'Priority:'}</span>
                  <p className="capitalize">{selectedBooking.priority}</p>
                </div>
              </div>

              {selectedBooking.technicianName && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className={`font-medium mb-2 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
                    {language === 'ta' ? 'தொழிலாளர் விபரங்கள்:' : 'Technician Details:'}
                  </h4>
                  <p>{selectedBooking.technicianName}</p>
                  <p className="text-sm text-gray-600">{selectedBooking.technicianPhone}</p>
                </div>
              )}

              <div>
                <span className="font-medium">{language === 'ta' ? 'முகவரி:' : 'Address:'}</span>
                <p>{selectedBooking.contactInfo.address}</p>
              </div>

              {(selectedBooking.estimatedCost || selectedBooking.actualCost) && (
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className={`font-medium mb-2 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
                    {language === 'ta' ? 'கட்டண விபரங்கள்:' : 'Cost Details:'}
                  </h4>
                  {selectedBooking.estimatedCost && (
                    <p>{language === 'ta' ? 'மதிப்பிடப்பட்ட விலை:' : 'Estimated:'} ₹{selectedBooking.estimatedCost}</p>
                  )}
                  {selectedBooking.actualCost && (
                    <p>{language === 'ta' ? 'மொத்த கட்டணம்:' : 'Total Paid:'} ₹{selectedBooking.actualCost}</p>
                  )}
                </div>
              )}

              <div className="flex space-x-2">
                {selectedBooking.technicianPhone && (
                  <Button
                    onClick={() => handleWhatsAppContact(selectedBooking.technicianPhone!, selectedBooking.id)}
                    className="flex-1 bg-green-500 text-white hover:bg-green-600"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    <span className={language === 'ta' ? 'font-tamil' : 'font-english'}>
                      {language === 'ta' ? 'WhatsApp செய்' : 'WhatsApp'}
                    </span>
                  </Button>
                )}
                <Button
                  onClick={() => handleQuickRebook(selectedBooking)}
                  variant="secondary"
                  className="flex-1"
                >
                  <Repeat className="w-4 h-4 mr-2" />
                  <span className={language === 'ta' ? 'font-tamil' : 'font-english'}>
                    {language === 'ta' ? 'மீண்டும் பதிவு' : 'Rebook'}
                  </span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

