// apps/frontend/src/components/admin/AdminDashboard.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  Calendar, 
  MapPin, 
  Star,
  DollarSign,
  AlertTriangle,
  Clock,
  CheckCircle,
  Phone,
  MessageCircle,
  Eye,
  TrendingUp,
  TrendingDown,
  Globe,
  Bell,
  Settings,
  RefreshCw,
  UserCheck,
  Navigation,
  Plus,
  Zap,
  Droplets
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { StatusBadge } from '../ui/status-badge';
import { useAuth } from '../../hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BookingManagementSystem } from './BookingManagementSystem';

interface DashboardMetrics {
  today: {
    newBookings: number;
    completedJobs: number;
    pendingJobs: number;
    totalRevenue: number;
    averageRating: number;
  };
  thisWeek: {
    totalBookings: number;
    revenue: number;
    completionRate: number;
    emergencyJobs: number;
  };
  technicians: {
    total: number;
    available: number;
    busy: number;
    offline: number;
  };
}

interface Booking {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  serviceType: 'electrical' | 'plumbing';
  title: string;
  description: string;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'normal' | 'urgent' | 'emergency';
  scheduledTime: string;
  contactInfo: {
    address: string;
    location?: { lat: number; lng: number };
  };
  assignedTechnicianId?: string;
  assignedTechnician?: Technician;
  estimatedCost: number;
  actualCost?: number;
  paymentStatus: 'pending' | 'paid';
  rating?: number;
  review?: string;
  createdAt: string;
  language: 'ta' | 'en';
}

interface Technician {
  id: string;
  name: string;
  phone: string;
  skills: string[];
  status: 'available' | 'busy' | 'off-duty';
  currentLocation?: { lat: number; lng: number; address: string };
  rating: number;
  completedJobs: number;
  activeBookingId?: string;
}

const AdminDashboard: React.FC = () => {
  const { user, isLoading, isAdmin, updateUserMetadata } = useAuth();
  const [language, setLanguage] = useState<'ta' | 'en'>('ta');
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'technicians'>('overview');
  const [emergencyAlerts, setEmergencyAlerts] = useState<Booking[]>([]);
  const queryClient = useQueryClient();

  // Set language from user preference
  useEffect(() => {
    if (user?.language) {
      setLanguage(user.language);
    }
  }, [user?.language]);

  // Fetch dashboard metrics
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['admin-metrics'],
    queryFn: async (): Promise<DashboardMetrics> => {
      await new Promise(resolve => setTimeout(resolve, 800));
      return {
        today: {
          newBookings: 12,
          completedJobs: 8,
          pendingJobs: 4,
          totalRevenue: 5600,
          averageRating: 4.7
        },
        thisWeek: {
          totalBookings: 67,
          revenue: 28400,
          completionRate: 91.5,
          emergencyJobs: 3
        },
        technicians: {
          total: 6,
          available: 3,
          busy: 2,
          offline: 1
        }
      };
    },
    refetchInterval: 30000,
    enabled: !!user && isAdmin()
  });

  // Fetch recent bookings for overview
  const { data: recentBookings = [] } = useQuery({
    queryKey: ['recent-bookings'],
    queryFn: async (): Promise<Booking[]> => {
      await new Promise(resolve => setTimeout(resolve, 600));
      const mockBookings: Booking[] = [
        {
          id: 'BK001',
          customerId: 'C001',
          customerName: 'ராஜேஷ் குமார்',
          customerPhone: '9876543210',
          serviceType: 'electrical',
          title: 'விசிறி பழுது',
          description: 'வீட்டு விசிறி வேலை செய்யவில்லை',
          status: 'pending',
          priority: 'emergency',
          scheduledTime: '2024-12-15T09:00:00',
          contactInfo: { 
            address: '123, காந்தி சாலை, நாகர்கோயில்',
            location: { lat: 8.1778, lng: 77.4362 }
          },
          estimatedCost: 200,
          paymentStatus: 'pending',
          createdAt: '2024-12-14T20:30:00',
          language: 'ta'
        },
        {
          id: 'BK002',
          customerId: 'C002',
          customerName: 'சுரேஷ் பிரியா',
          customerPhone: '9876543220',
          serviceType: 'plumbing',
          title: 'குழாய் கசிவு',
          description: 'குளியலறை குழாய் கசிகிறது',
          status: 'in-progress',
          priority: 'urgent',
          scheduledTime: '2024-12-15T10:30:00',
          contactInfo: {
            address: '456, அண்ணா நகர், நாகர்கோயில்',
            location: { lat: 8.1745, lng: 77.4398 }
          },
          assignedTechnicianId: 'T002',
          estimatedCost: 300,
          paymentStatus: 'pending',
          createdAt: '2024-12-14T19:15:00',
          language: 'ta'
        },
        {
          id: 'BK003',
          customerId: 'C003',
          customerName: 'மாலா தேவி',
          customerPhone: '9876543230',
          serviceType: 'electrical',
          title: 'சுவிட்ச் பழுது',
          description: 'மின் சுவிட்ச் வேலை செய்யவில்லை',
          status: 'completed',
          priority: 'normal',
          scheduledTime: '2024-12-14T14:00:00',
          contactInfo: {
            address: '789, ஜெய்நகர், நாகர்கோயில்'
          },
          assignedTechnicianId: 'T001',
          estimatedCost: 150,
          actualCost: 180,
          paymentStatus: 'paid',
          rating: 5,
          review: 'மிகச்சிறந்த வேலை. நேரத்தில் வந்து சரியாக செய்தார்.',
          createdAt: '2024-12-13T16:45:00',
          language: 'ta'
        }
      ];
      
      return mockBookings.slice(0, 5); // Return only recent 5
    },
    refetchInterval: 15000,
    enabled: !!user && isAdmin()
  });

  // Fetch technicians
  const { data: technicians = [] } = useQuery({
    queryKey: ['admin-technicians'],
    queryFn: async (): Promise<Technician[]> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return [
        {
          id: 'T001',
          name: 'முருகன் குமார்',
          phone: '9876543240',
          skills: ['electrical', 'fan-repair', 'wiring'],
          status: 'busy',
          currentLocation: { lat: 8.1778, lng: 77.4362, address: 'காந்தி சாலை' },
          rating: 4.8,
          completedJobs: 156,
          activeBookingId: 'BK003'
        },
        {
          id: 'T002',
          name: 'ராமன் செல்வம்',
          phone: '9876543250',
          skills: ['plumbing', 'pipe-repair'],
          status: 'busy',
          currentLocation: { lat: 8.1745, lng: 77.4398, address: 'அண்ணா நகர்' },
          rating: 4.6,
          completedJobs: 98,
          activeBookingId: 'BK002'
        },
        {
          id: 'T003',
          name: 'கிருஷ்ணன் ராஜ்',
          phone: '9876543260',
          skills: ['electrical', 'plumbing'],
          status: 'available',
          currentLocation: { lat: 8.1823, lng: 77.4287, address: 'ஜெய்நகர்' },
          rating: 4.9,
          completedJobs: 203
        }
      ];
    },
    refetchInterval: 30000,
    enabled: !!user && isAdmin()
  });

  // Monitor emergency bookings
  useEffect(() => {
    const emergencies = recentBookings.filter(b => b.priority === 'emergency' && b.status === 'pending');
    setEmergencyAlerts(emergencies);
  }, [recentBookings]);

  // Check admin access
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading...</h2>
          <p className="text-gray-600">Checking admin access...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
          <Button 
            onClick={() => updateUserMetadata({ role: 'admin' })}
            className="mb-2"
          >
            Grant Admin Access (Development)
          </Button>
          <p className="text-xs text-gray-500">This button is for development purposes only</p>
        </Card>
      </div>
    );
  }

  // Render overview tab content
  const renderOverview = () => (
    <div className="space-y-6 p-6">
      {/* Emergency Alerts */}
      {emergencyAlerts.length > 0 && (
        <Card className="border-red-500 bg-red-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-red-800">
              <AlertTriangle className="w-5 h-5 mr-2 animate-pulse" />
              {language === 'ta' ? '🚨 அவசர அறிவிப்புகள்' : '🚨 Emergency Alerts'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {emergencyAlerts.map(booking => (
                <div key={booking.id} className="flex items-center justify-between bg-white rounded p-3 border border-red-200">
                  <div>
                    <span className="font-medium">{booking.title}</span>
                    <span className="text-sm text-gray-600 ml-2">- {booking.customerName}</span>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => window.open(`tel:+91${booking.customerPhone}`)}
                      size="sm"
                      variant="secondary"
                    >
                      <Phone className="w-4 h-4 mr-1" />
                      {language === 'ta' ? 'அழை' : 'Call'}
                    </Button>
                    <Button
                      onClick={() => setActiveTab('bookings')}
                      size="sm"
                      variant="secondary"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      {language === 'ta' ? 'பார்' : 'View'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metrics Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {language === 'ta' ? 'இன்றைய பதிவுகள்' : "Today's Bookings"}
                </p>
                <div className="flex items-center">
                  <p className="text-2xl font-bold">{metrics?.today.newBookings || 0}</p>
                  <TrendingUp className="w-4 h-4 text-green-600 ml-2" />
                </div>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {language === 'ta' ? 'முடிந்த வேலைகள்' : 'Completed Jobs'}
                </p>
                <div className="flex items-center">
                  <p className="text-2xl font-bold">{metrics?.today.completedJobs || 0}</p>
                  <CheckCircle className="w-4 h-4 text-green-600 ml-2" />
                </div>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {language === 'ta' ? 'இன்றைய வருமானம்' : "Today's Revenue"}
                </p>
                <div className="flex items-center">
                  <p className="text-2xl font-bold">₹{metrics?.today.totalRevenue || 0}</p>
                  <TrendingUp className="w-4 h-4 text-green-600 ml-2" />
                </div>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {language === 'ta' ? 'சராசரி மதிப்பீடு' : 'Average Rating'}
                </p>
                <div className="flex items-center">
                  <p className="text-2xl font-bold">{metrics?.today.averageRating || 0}</p>
                  <Star className="w-4 h-4 text-yellow-500 ml-2 fill-current" />
                </div>
              </div>
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings Preview */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              {language === 'ta' ? 'சமீபத்திய பதிவுகள்' : 'Recent Bookings'}
            </CardTitle>
            <Button
              onClick={() => setActiveTab('bookings')}
              variant="secondary"
              size="sm"
            >
              {language === 'ta' ? 'அனைத்தும் பார்' : 'View All'}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentBookings.slice(0, 3).map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${
                      booking.serviceType === 'electrical' 
                        ? 'bg-yellow-100 text-yellow-600' 
                        : 'bg-blue-100 text-blue-600'
                    }`}>
                      {booking.serviceType === 'electrical' ? 
                        <Zap className="w-4 h-4" /> : 
                        <Droplets className="w-4 h-4" />
                      }
                    </div>
                    <div>
                      <p className="font-medium text-sm">{booking.title}</p>
                      <p className="text-xs text-gray-600">{booking.customerName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <StatusBadge variant={booking.status}>
                      {booking.status}
                    </StatusBadge>
                    <p className="text-xs text-gray-600 mt-1">₹{booking.estimatedCost}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Technician Status */}
        <Card>
          <CardHeader>
            <CardTitle>
              {language === 'ta' ? 'தொழிலாளர் நிலை' : 'Technician Status'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {technicians.slice(0, 3).map((tech) => (
                <div key={tech.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      tech.status === 'available' ? 'bg-green-500' :
                      tech.status === 'busy' ? 'bg-yellow-500' : 'bg-gray-500'
                    }`}></div>
                    <div>
                      <p className="font-medium text-sm">{tech.name}</p>
                      <p className="text-xs text-gray-600">{tech.skills.join(', ')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{tech.rating}⭐</p>
                    <p className="text-xs text-gray-600">
                      {tech.status === 'available' 
                        ? language === 'ta' ? 'கிடைக்கிறது' : 'Available'
                        : tech.status === 'busy'
                        ? language === 'ta' ? 'வேலையில்' : 'Busy'
                        : language === 'ta' ? 'இல்லை' : 'Offline'
                      }
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderTechnicians = () => (
    <div className="p-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {technicians.map((tech) => (
          <Card key={tech.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${
                    tech.status === 'available' ? 'bg-green-500' :
                    tech.status === 'busy' ? 'bg-yellow-500' : 'bg-gray-500'
                  }`}></div>
                  <div>
                    <h3 className="font-bold">{tech.name}</h3>
                    <p className="text-sm text-gray-600">{tech.phone}</p>
                  </div>
                </div>
                <Button
                  onClick={() => window.open(`tel:+91${tech.phone}`)}
                  size="sm"
                  variant="secondary"
                >
                  <Phone className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Rating:</span>
                  <span className="text-sm font-medium">{tech.rating}⭐</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Jobs Completed:</span>
                  <span className="text-sm font-medium">{tech.completedJobs}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Skills:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {tech.skills.map(skill => (
                      <span key={skill} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                {tech.currentLocation && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Location:</span>
                    <div className="flex items-center space-x-1">
                      <span className="text-xs">{tech.currentLocation.address}</span>
                      <Button
                        onClick={() => {
                          const url = `https://maps.google.com/?q=${tech.currentLocation!.lat},${tech.currentLocation!.lng}`;
                          window.open(url, '_blank');
                        }}
                        size="sm"
                        variant="secondary"
                        className="p-1"
                      >
                        <Navigation className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview': 
        return renderOverview();
      case 'bookings': 
        return <BookingManagementSystem />;
      case 'technicians': 
        return renderTechnicians();
      default: 
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black">
                {language === 'ta' ? 'நிர்வாக டாஷ்போர்டு' : 'Admin Dashboard'}
              </h1>
              <p className="text-gray-600">
                {language === 'ta' ? `வணக்கம், ${user.name}` : `Welcome, ${user.name}`}
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => queryClient.invalidateQueries()}
                variant="secondary"
                size="sm"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {language === 'ta' ? 'புதுப்பி' : 'Refresh'}
              </Button>
              
              <Button
                onClick={() => setLanguage(language === 'ta' ? 'en' : 'ta')}
                variant="secondary"
                size="sm"
              >
                <Globe className="w-4 h-4 mr-2" />
                {language === 'ta' ? 'English' : 'தமிழ்'}
              </Button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 mt-4 border-b">
            {[
              { id: 'overview', name: 'Overview', name_ta: 'கண்ணோட்டம்', icon: BarChart3 },
              { id: 'bookings', name: 'Bookings', name_ta: 'பதிவுகள்', icon: Calendar },
              { id: 'technicians', name: 'Technicians', name_ta: 'தொழிலாளர்', icon: Users }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-t-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{language === 'ta' ? tab.name_ta : tab.name}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto">
        {renderTabContent()}
      </main>
    </div>
  );
};

export default AdminDashboard;