// apps/frontend/src/components/admin/AdminDashboard.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  Calendar, 
  MapPin, 
  Package, 
  Star,
  DollarSign,
  AlertTriangle,
  Clock,
  CheckCircle,
  Phone,
  MessageCircle,
  Eye,
  Edit,
  Download,
  Filter,
  Search,
  Zap,
  Droplets,
  TrendingUp,
  TrendingDown,
  Globe,
  Bell,
  Settings,
  RefreshCw,
  UserCheck,
  Navigation,
  Plus
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { StatusBadge } from '../ui/status-badge';
import { useAuthStore } from '../../stores/auth-store';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useSortable, arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';

import { CSS } from '@dnd-kit/utilities';

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

interface Product {
  id: string;
  nameEn: string;
  nameTa: string;
  category: string;
  price: number;
  stockQuantity: number;
  reorderLevel: number;
  totalSold: number;
  lastSoldAt?: string;
  needsReorder: boolean;
}

interface ServiceArea {
  id: string;
  areaName: string;
  pincode: string;
  isCovered: boolean;
  activeBookings: number;
  techniciansNearby: number;
}

// Draggable Booking Card Component
const DraggableBookingCard: React.FC<{ 
  booking: Booking; 
  technicians: Technician[]; 
  onAssign: (bookingId: string, technicianId: string) => void;
  language: 'ta' | 'en';
}> = ({ booking, technicians, onAssign, language }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: booking.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'emergency': return 'border-red-500 bg-red-50';
      case 'urgent': return 'border-yellow-500 bg-yellow-50';
      default: return 'border-gray-200 bg-white';
    }
  };

  const availableTechnicians = technicians.filter(t => 
    t.status === 'available' && 
    t.skills.includes(booking.serviceType)
  );

  return (
    <Card 
      ref={setNodeRef} 
      style={style} 
      className={`cursor-grab active:cursor-grabbing ${getPriorityColor(booking.priority)} hover:shadow-md transition-all`}
      {...attributes} 
      {...listeners}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className={`p-1 rounded-full ${
              booking.serviceType === 'electrical' 
                ? 'bg-electrical-100 text-electrical-600' 
                : 'bg-plumbing-100 text-plumbing-600'
            }`}>
              {booking.serviceType === 'electrical' ? 
                <Zap className="w-4 h-4" /> : 
                <Droplets className="w-4 h-4" />
              }
            </div>
            <div>
              <h4 className="font-bold text-sm">{booking.title}</h4>
              <p className="text-xs text-gray-600">#{booking.id}</p>
            </div>
          </div>
          <StatusBadge variant={booking.priority === 'emergency' ? 'emergency' : 'pending'}>
            {booking.priority === 'emergency' && '🚨'} 
            {booking.status}
          </StatusBadge>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center text-gray-600">
            <Users className="w-3 h-3 mr-1" />
            <span>{booking.customerName}</span>
            <Phone className="w-3 h-3 ml-2 mr-1" />
            <span>{booking.customerPhone}</span>
          </div>
          
          <div className="flex items-center text-gray-600">
            <Clock className="w-3 h-3 mr-1" />
            <span>
              {new Date(booking.scheduledTime).toLocaleString(
                booking.language === 'ta' ? 'ta-IN' : 'en-IN',
                { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
              )}
            </span>
          </div>

          <div className="flex items-center text-gray-600">
            <MapPin className="w-3 h-3 mr-1" />
            <span className="truncate">{booking.contactInfo.address}</span>
          </div>

          <div className="flex items-center text-green-600 font-medium">
            <DollarSign className="w-3 h-3 mr-1" />
            <span>₹{booking.estimatedCost}</span>
          </div>
        </div>

        {booking.assignedTechnician ? (
          <div className="mt-3 p-2 bg-green-50 rounded border border-green-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <UserCheck className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  {booking.assignedTechnician.name}
                </span>
              </div>
              <Button
                onClick={() => window.open(`tel:+91${booking.assignedTechnician!.phone}`)}
                size="sm"
                variant="secondary"
                className="text-xs py-1 px-2"
              >
                <Phone className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-3">
            <select
              onChange={(e) => e.target.value && onAssign(booking.id, e.target.value)}
              className="w-full text-xs border rounded px-2 py-1"
              defaultValue=""
            >
              <option value="">{language === 'ta' ? 'தொழிலாளர் தேர்வு' : 'Assign Technician'}</option>
              {availableTechnicians.map(tech => (
                <option key={tech.id} value={tech.id}>
                  {tech.name} ({tech.rating}⭐) - {tech.skills.join(', ')}
                </option>
              ))}
            </select>
          </div>
        )}

        {booking.priority === 'emergency' && (
          <div className="mt-2 flex space-x-1">
            <Button
              onClick={() => window.open(`tel:+91${booking.customerPhone}`)}
              size="sm"
              variant="emergency"
              className="flex-1 text-xs py-1"
            >
              <Phone className="w-3 h-3 mr-1" />
              {language === 'ta' ? 'அழை' : 'Call'}
            </Button>
            <Button
              onClick={() => {
                const message = language === 'ta' 
                  ? `அவசர சேவை: ${booking.title}. எங்கள் டீம் 15 நிமிடத்தில் வரும்.`
                  : `Emergency service: ${booking.title}. Our team will arrive in 15 minutes.`;
                window.open(`https://wa.me/91${booking.customerPhone}?text=${encodeURIComponent(message)}`, '_blank');
              }}
              size="sm"
              className="flex-1 text-xs py-1 bg-green-500 hover:bg-green-600"
            >
              <MessageCircle className="w-3 h-3 mr-1" />
              WhatsApp
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const AdminDashboard: React.FC = () => {
  const { language, setLanguage, user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'queue' | 'technicians' | 'areas' | 'inventory' | 'feedback' | 'reports'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [emergencyAlerts, setEmergencyAlerts] = useState<Booking[]>([]);
  const queryClient = useQueryClient();

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Fetch booking queue
  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ['admin-bookings', filterStatus, searchQuery],
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
          status: 'pending',
          priority: 'urgent',
          scheduledTime: '2024-12-15T10:30:00',
          contactInfo: { 
            address: '456, அண்ணா நகர், நாகர்கோயில்',
            location: { lat: 8.1745, lng: 77.4398 }
          },
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
          status: 'confirmed',
          priority: 'normal',
          scheduledTime: '2024-12-15T14:00:00',
          contactInfo: { 
            address: '789, ஜெய்நகர், நாகர்கோயில்',
            location: { lat: 8.1823, lng: 77.4287 }
          },
          assignedTechnicianId: 'T001',
          assignedTechnician: {
            id: 'T001',
            name: 'முருகன் குமார்',
            phone: '9876543240',
            skills: ['electrical'],
            status: 'busy',
            rating: 4.8,
            completedJobs: 156
          },
          estimatedCost: 150,
          paymentStatus: 'pending',
          createdAt: '2024-12-14T16:45:00',
          language: 'ta'
        }
      ];
      
      // Filter by status and search query
      return mockBookings
        .filter(b => filterStatus === 'all' || b.status === filterStatus)
        .filter(b => searchQuery === '' || 
          b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => {
          // Priority sorting: emergency > urgent > normal
          const priorityOrder = { emergency: 3, urgent: 2, normal: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        });
    },
    refetchInterval: 15000 // Refresh every 15 seconds
  });

  // Fetch technicians
  const { data: technicians = [], isLoading: techniciansLoading } = useQuery({
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
          skills: ['plumbing', 'pipe-repair', 'toilet-repair'],
          status: 'available',
          currentLocation: { lat: 8.1823, lng: 77.4287, address: 'ஜெய்நகர்' },
          rating: 4.6,
          completedJobs: 98
        },
        {
          id: 'T003',
          name: 'கிருஷ்ணன் ராஜ்',
          phone: '9876543260',
          skills: ['electrical', 'plumbing', 'emergency'],
          status: 'available',
          currentLocation: { lat: 8.1745, lng: 77.4398, address: 'அண்ணா நகர்' },
          rating: 4.9,
          completedJobs: 203
        },
        {
          id: 'T004',
          name: 'விஜய் குமார்',
          phone: '9876543270',
          skills: ['electrical', 'lighting', 'switch-repair'],
          status: 'busy',
          rating: 4.4,
          completedJobs: 87,
          activeBookingId: 'BK005'
        },
        {
          id: 'T005',
          name: 'அருண் பிரசாத்',
          phone: '9876543280',
          skills: ['plumbing', 'tank-service'],
          status: 'off-duty',
          rating: 4.7,
          completedJobs: 145
        },
        {
          id: 'T006',
          name: 'ரவி சந்திரன்',
          phone: '9876543290',
          skills: ['electrical', 'plumbing', 'emergency'],
          status: 'available',
          currentLocation: { lat: 8.1689, lng: 77.4445, address: 'மாரியம்மன் கோவில்' },
          rating: 4.5,
          completedJobs: 134
        }
      ];
    },
    refetchInterval: 30000
  });

  // Fetch products for inventory
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['admin-inventory'],
    queryFn: async (): Promise<Product[]> => {
      await new Promise(resolve => setTimeout(resolve, 400));
      return [
        {
          id: 'P001',
          nameEn: 'LED Bulb 9W',
          nameTa: 'LED பல்ப் 9W',
          category: 'electrical-fixtures',
          price: 150,
          stockQuantity: 25,
          reorderLevel: 10,
          totalSold: 45,
          lastSoldAt: '2024-12-14T15:30:00',
          needsReorder: false
        },
        {
          id: 'P002',
          nameEn: 'Switch Board 6M',
          nameTa: 'சுவிட்ச் போர்டு 6M',
          category: 'electrical-switches',
          price: 580,
          stockQuantity: 3,
          reorderLevel: 5,
          totalSold: 12,
          lastSoldAt: '2024-12-13T11:20:00',
          needsReorder: true
        },
        {
          id: 'P003',
          nameEn: 'PVC Pipe 1/2"',
          nameTa: 'PVC குழாய் 1/2"',
          category: 'plumbing-pipes',
          price: 60,
          stockQuantity: 85,
          reorderLevel: 20,
          totalSold: 23,
          lastSoldAt: '2024-12-14T09:45:00',
          needsReorder: false
        },
        {
          id: 'P004',
          nameEn: 'Bathroom Tap Chrome',
          nameTa: 'குளியலறை குழாய் குரோம்',
          category: 'plumbing-fixtures',
          price: 1100,
          stockQuantity: 2,
          reorderLevel: 5,
          totalSold: 8,
          lastSoldAt: '2024-12-12T16:10:00',
          needsReorder: true
        }
      ];
    },
    refetchInterval: 60000
  });

  // Assign technician mutation
  const assignTechnicianMutation = useMutation({
    mutationFn: async ({ bookingId, technicianId }: { bookingId: string; technicianId: string }) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return { bookingId, technicianId };
    },
    onSuccess: (data) => {
      // Update local state and refresh
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['admin-technicians'] });
      
      // Show success notification
      const booking = bookings.find(b => b.id === data.bookingId);
      const technician = technicians.find(t => t.id === data.technicianId);
      if (booking && technician) {
        // In a real app, show toast notification
        console.log(`Assigned ${technician.name} to ${booking.title}`);
      }
    }
  });

  // Handle drag end for technician assignment
  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      // If dropped on a technician, assign
      const technicianId = over.id;
      const bookingId = active.id;
      assignTechnicianMutation.mutate({ bookingId, technicianId });
    }
  };

  // Monitor emergency bookings
  useEffect(() => {
    const emergencies = bookings.filter(b => b.priority === 'emergency' && b.status === 'pending');
    setEmergencyAlerts(emergencies);
    
    // In a real app, this would trigger browser notifications or sound alerts
    if (emergencies.length > 0) {
      console.log(`🚨 ${emergencies.length} emergency alerts!`);
    }
  }, [bookings]);

  // Export functionality
  const handleExportReport = (type: 'bookings' | 'revenue' | 'technicians') => {
    // In a real app, this would call an API to generate and download reports
    const data = type === 'bookings' ? bookings : 
                 type === 'revenue' ? metrics :
                 technicians;
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderOverview = () => (
    <div className="space-y-6">
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
                      variant="emergency"
                    >
                      <Phone className="w-4 h-4 mr-1" />
                      {language === 'ta' ? 'அழை' : 'Call'}
                    </Button>
                    <Button
                      onClick={() => setActiveTab('queue')}
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
                <p className={`text-sm font-medium text-gray-600 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
                  {language === 'ta' ? 'இன்றைய பதிவுகள்' : "Today's Bookings"}
                </p>
                <div className="flex items-center">
                  <p className="text-2xl font-bold">{metrics?.today.newBookings || 0}</p>
                  <TrendingUp className="w-4 h-4 text-green-600 ml-2" />
                </div>
              </div>
              <Calendar className="w-8 h-8 text-primary-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium text-gray-600 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
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
                <p className={`text-sm font-medium text-gray-600 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
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
                <p className={`text-sm font-medium text-gray-600 ${language === 'ta' ? 'font-ta' : 'font-english'}`}>
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

      {/* Technician Status Overview */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className={`flex items-center ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
              <Users className="w-5 h-5 mr-2" />
              {language === 'ta' ? 'தொழிலாளர்கள் நிலை' : 'Technician Status'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className={language === 'ta' ? 'font-tamil' : 'font-english'}>
                    {language === 'ta' ? 'கிடைக்கிறார்கள்' : 'Available'}
                  </span>
                </div>
                <span className="font-bold">{metrics?.technicians.available || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                  <span className={language === 'ta' ? 'font-ta' : 'font-english'}>
                    {language === 'ta' ? 'பிசி' : 'Busy'}
                  </span>
                </div>
                <span className="font-bold">{metrics?.technicians.busy || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gray-500 rounded-full mr-2"></div>
                  <span className={language === 'ta' ? 'font-tamil' : 'font-english'}>
                    {language === 'ta' ? 'ஆஃப்லைன்' : 'Offline'}
                  </span>
                </div>
                <span className="font-bold">{metrics?.technicians.offline || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className={`flex items-center ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
              <BarChart3 className="w-5 h-5 mr-2" />
              {language === 'ta' ? 'இந்த வாரம்' : 'This Week'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className={language === 'ta' ? 'font-tamil' : 'font-english'}>
                  {language === 'ta' ? 'மொத்த பதிவுகள்:' : 'Total Bookings:'}
                </span>
                <span className="font-bold">{metrics?.thisWeek.totalBookings || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={language === 'ta' ? 'font-tamil' : 'font-english'}>
                  {language === 'ta' ? 'வருமானம்:' : 'Revenue:'}
                </span>
                <span className="font-bold text-green-600">₹{metrics?.thisWeek.revenue || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={language === 'ta' ? 'font-tamil' : 'font-english'}>
                  {language === 'ta' ? 'முடிப்பு விகிதம்:' : 'Completion Rate:'}
                </span>
                <span className="font-bold text-blue-600">{metrics?.thisWeek.completionRate || 0}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderBookingQueue = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className={`text-2xl font-bold ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
          {language === 'ta' ? 'பதிவுகள் வரிசை' : 'Booking Queue'}
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="flex gap-2">
            <Input
              placeholder={language === 'ta' ? 'தேடுங்கள்...' : 'Search...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64"
            />
            <Button variant="secondary" size="sm">
              <Search className="w-4 h-4" />
            </Button>
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm"
          >
            <option value="all">{language === 'ta' ? 'எல்லாம்' : 'All Status'}</option>
            <option value="pending">{language === 'ta' ? 'காத்திருக்கும்' : 'Pending'}</option>
            <option value="confirmed">{language === 'ta' ? 'உறுதி' : 'Confirmed'}</option>
            <option value="in-progress">{language === 'ta' ? 'நடைபெறுகிறது' : 'In Progress'}</option>
          </select>
          
          <Button
            onClick={() => handleExportReport('bookings')}
            variant="secondary"
            size="sm"
          >
            <Download className="w-4 h-4 mr-1" />
            {language === 'ta' ? 'ஏற்றுமதி' : 'Export'}
          </Button>
        </div>
      </div>

      {bookingsLoading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <div className="grid gap-4">
            <SortableContext items={bookings.map(b => b.id)} strategy={verticalListSortingStrategy}>
              {bookings.map((booking) => (
                <DraggableBookingCard
                  key={booking.id}
                  booking={booking}
                  technicians={technicians}
                  onAssign={(bookingId, technicianId) => 
                    assignTechnicianMutation.mutate({ bookingId, technicianId })
                  }
                  language={language}
                />
              ))}
            </SortableContext>
          </div>
        </DndContext>
      )}

      {bookings.length === 0 && !bookingsLoading && (
        <Card className="p-8 text-center">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className={`text-lg text-gray-600 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
            {language === 'ta' ? 'தற்போது எந்த பதிவும் இல்லை' : 'No bookings found'}
          </p>
        </Card>
      )}
    </div>
  );

  const renderTechnicianManagement = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className={`text-2xl font-bold ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
          {language === 'ta' ? 'தொழிலாளர் மேலாண்மை' : 'Technician Management'}
        </h2>
        <Button
          onClick={() => handleExportReport('technicians')}
          variant="secondary"
        >
          <Download className="w-4 h-4 mr-2" />
          {language === 'ta' ? 'ஏற்றுமதி' : 'Export'}
        </Button>
      </div>

      <div className="grid gap-4">
        {techniciansLoading ? (
          [1, 2, 3].map(i => (
            <Card key={i} className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </Card>
          ))
        ) : (
          technicians.map((technician) => (
            <Card key={technician.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-full ${
                      technician.status === 'available' ? 'bg-green-100 text-green-600' :
                      technician.status === 'busy' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      <Users className="w-6 h-6" />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-lg font-bold">{technician.name}</h3>
                      <p className="text-gray-600">{technician.phone}</p>
                      
                      <div className="flex items-center mt-2 space-x-4">
                        <StatusBadge variant={
                          technician.status === 'available' ? 'available' :
                          technician.status === 'busy' ? 'busy' : 'off-duty'
                        }>
                          {language === 'ta' ? (
                            technician.status === 'available' ? 'கிடைக்கிறார்' :
                            technician.status === 'busy' ? 'பிசி' : 'ஆஃப்லைன்'
                          ) : technician.status}
                        </StatusBadge>
                        
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-500 fill-current mr-1" />
                          <span className="text-sm font-medium">{technician.rating}</span>
                        </div>
                        
                        <span className="text-sm text-gray-600">
                          {technician.completedJobs} {language === 'ta' ? 'வேலைகள்' : 'jobs'}
                        </span>
                      </div>
                      
                      <div className="mt-2">
                        <span className="text-sm text-gray-600">
                          {language === 'ta' ? 'திறமைகள்:' : 'Skills:'}
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {technician.skills.map(skill => (
                            <span key={skill} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      {technician.currentLocation && (
                        <div className="mt-2 flex items-center text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mr-1" />
                          <span>{technician.currentLocation.address}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <Button
                      onClick={() => window.open(`tel:+91${technician.phone}`)}
                      size="sm"
                      variant="secondary"
                    >
                      <Phone className="w-4 h-4 mr-1" />
                      {language === 'ta' ? 'அழை' : 'Call'}
                    </Button>
                    
                    {technician.currentLocation && (
                      <Button
                        onClick={() => {
                          // Open Google Maps with technician location
                          const url = `https://maps.google.com/?q=${technician.currentLocation!.lat},${technician.currentLocation!.lng}`;
                          window.open(url, '_blank');
                        }}
                        size="sm"
                        variant="secondary"
                      >
                        <Navigation className="w-4 h-4 mr-1" />
                        {language === 'ta' ? 'இருப்பிடம்' : 'Location'}
                      </Button>
                    )}
                    
                    <Button
                      onClick={() => {
                        // Toggle technician status
                        console.log(`Toggle status for ${technician.name}`);
                      }}
                      size="sm"
                      variant="secondary"
                    >
                      <Settings className="w-4 h-4 mr-1" />
                      {language === 'ta' ? 'மாற்று' : 'Update'}
                    </Button>
                  </div>
                </div>
                
                {technician.activeBookingId && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-yellow-800">
                        {language === 'ta' ? 'தற்போதைய பணி:' : 'Current Job:'} #{technician.activeBookingId}
                      </span>
                      <Button
                        onClick={() => {
                          const booking = bookings.find(b => b.id === technician.activeBookingId);
                          if (booking) {
                            // Show booking details
                            console.log('Show booking details', booking);
                          }
                        }}
                        size="sm"
                        variant="secondary"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        {language === 'ta' ? 'பார்' : 'View'}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );

  const renderInventoryManagement = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className={`text-2xl font-bold ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
          {language === 'ta' ? 'பொருட்கள் கையிருப்பு' : 'Product Inventory'}
        </h2>
        <div className="flex space-x-2">
          <Button variant="secondary" size="sm">
            <Plus className="w-4 h-4 mr-1" />
            {language === 'ta' ? 'புதிய பொருள்' : 'Add Product'}
          </Button>
          <Button
            onClick={() => handleExportReport('technicians')}
            variant="secondary"
            size="sm"
          >
            <Download className="w-4 h-4 mr-1" />
            {language === 'ta' ? 'ஏற்றுமதி' : 'Export'}
          </Button>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {products.some(p => p.needsReorder) && (
        <Card className="border-orange-500 bg-orange-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-orange-800">
              <Package className="w-5 h-5 mr-2" />
              {language === 'ta' ? '⚠️ குறைவான கையிருப்பு' : '⚠️ Low Stock Alert'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {products.filter(p => p.needsReorder).map(product => (
                <div key={product.id} className="flex items-center justify-between bg-white rounded p-3 border border-orange-200">
                  <div>
                    <span className="font-medium">
                      {product[language === 'ta' ? 'nameTa' : 'nameEn']}
                    </span>
                    <span className="text-sm text-gray-600 ml-2">
                      {language === 'ta' ? 'கையிருப்பு:' : 'Stock:'} {product.stockQuantity}
                    </span>
                  </div>
                  <Button size="sm" variant="secondary">
                    <Plus className="w-4 h-4 mr-1" />
                    {language === 'ta' ? 'ஆர்டர்' : 'Reorder'}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {productsLoading ? (
          [1, 2, 3, 4].map(i => (
            <Card key={i} className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </Card>
          ))
        ) : (
          products.map((product) => (
            <Card key={product.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-full ${
                      product.needsReorder ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
                    }`}>
                      <Package className="w-6 h-6" />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-lg font-bold">
                        {product[language === 'ta' ? 'nameTa' : 'nameEn']}
                      </h3>
                      <p className="text-gray-600 capitalize">{product.category}</p>
                      
                      <div className="grid sm:grid-cols-4 gap-4 mt-3 text-sm">
                        <div>
                          <span className="text-gray-600">
                            {language === 'ta' ? 'விலை:' : 'Price:'}
                          </span>
                          <p className="font-medium">₹{product.price}</p>
                        </div>
                        
                        <div>
                          <span className="text-gray-600">
                            {language === 'ta' ? 'கையிருப்பு:' : 'Stock:'}
                          </span>
                          <p className={`font-medium ${
                            product.stockQuantity <= product.reorderLevel ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {product.stockQuantity}
                          </p>
                        </div>
                        
                        <div>
                          <span className="text-gray-600">
                            {language === 'ta' ? 'விற்பனை:' : 'Sold:'}
                          </span>
                          <p className="font-medium">{product.totalSold}</p>
                        </div>
                        
                        <div>
                          <span className="text-gray-600">
                            {language === 'ta' ? 'கடைசி விற்பனை:' : 'Last Sold:'}
                          </span>
                          <p className="font-medium">
                            {product.lastSoldAt ? 
                              new Date(product.lastSoldAt).toLocaleDateString(
                                language === 'ta' ? 'ta-IN' : 'en-IN'
                              ) : 'N/A'
                            }
                          </p>
                        </div>
                      </div>
                      
                      {product.needsReorder && (
                        <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded text-sm">
                          <span className="text-orange-800 font-medium">
                            ⚠️ {language === 'ta' ? 'மீண்டும் ஆர்டர் செய்யவும்' : 'Reorder needed'} 
                            ({language === 'ta' ? 'குறைந்தபட்சம்' : 'Minimum'}: {product.reorderLevel})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <Button size="sm" variant="secondary">
                      <Edit className="w-4 h-4 mr-1" />
                      {language === 'ta' ? 'திருத்து' : 'Edit'}
                    </Button>
                    
                    <Button size="sm" variant="secondary">
                      <Plus className="w-4 h-4 mr-1" />
                      {language === 'ta' ? 'சேர்' : 'Add Stock'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'queue': return renderBookingQueue();
      case 'technicians': return renderTechnicianManagement();
      case 'inventory': return renderInventoryManagement();
      default: return renderOverview();
    }
  };

  // RBAC check
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-2xl font-black ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
                {language === 'ta' ? 'நிர்வாக டாஷ்போர்டு' : 'Admin Dashboard'}
              </h1>
              <p className="text-gray-600">
                {language === 'ta' ? `வணக்கம், ${user.name}` : `Welcome, ${user.name}`}
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              {emergencyAlerts.length > 0 && (
                <Button
                  onClick={() => setActiveTab('queue')}
                  variant="emergency"
                  size="sm"
                  className="animate-pulse"
                >
                  <Bell className="w-4 h-4 mr-2" />
                  {emergencyAlerts.length} {language === 'ta' ? 'அவசரம்' : 'Alerts'}
                </Button>
              )}
              
              <Button
                onClick={() => {
                  queryClient.invalidateQueries();
                }}
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
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'overview', label: language === 'ta' ? 'மேலோட்டம்' : 'Overview', icon: BarChart3 },
              { id: 'queue', label: language === 'ta' ? 'பதிவுகள் வரிசை' : 'Booking Queue', icon: Clock },
              { id: 'technicians', label: language === 'ta' ? 'தொழிலாளர்கள்' : 'Technicians', icon: Users },
              { id: 'inventory', label: language === 'ta' ? 'கையிருப்பு' : 'Inventory', icon: Package },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className={`font-medium ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
                    {tab.label}
                  </span>
                  {tab.id === 'queue' && emergencyAlerts.length > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                      {emergencyAlerts.length}
                    </span>
                  )}
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
    </div>
  );
};

export default AdminDashboard;