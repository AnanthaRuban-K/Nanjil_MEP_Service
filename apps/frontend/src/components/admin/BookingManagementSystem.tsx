// apps/frontend/src/components/admin/BookingManagementSystem.tsx
'use client';

import React, { useState, useRef } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  MessageCircle, 
  User, 
  Zap, 
  Droplets,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Camera,
  Upload,
  Star,
  Send,
  Navigation,
  Filter,
  Search,
  Eye,
  Edit,
  Play,
  Pause,
  Square,
  Download,
  FileText,
  Bell,
  UserCheck,
  MapIcon,
  Timer,

  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { StatusBadge } from '../ui/status-badge';
import { useAuthStore } from '../../stores/auth-store';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import SignatureCanvas from 'react-signature-canvas';

interface Booking {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerLanguage: 'ta' | 'en';
  serviceType: 'electrical' | 'plumbing';
  title: string;
  description: string;
  problemPhotos: string[];
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'normal' | 'urgent' | 'emergency';
  scheduledTime: string;
  contactInfo: {
    address: string;
    location?: { lat: number; lng: number };
    landmarks?: string;
  };
  assignedTechnicianId?: string;
  assignedTechnician?: Technician;
  estimatedCost: number;
  actualCost?: number;
  startTime?: string;
  endTime?: string;
  duration?: number; // in minutes
  completionPhotos?: string[];
  digitalSignature?: string;
  paymentStatus: 'pending' | 'paid';
  rating?: number;
  review?: string;
  satisfactionSurvey?: {
    timeliness: number;
    quality: number;
    communication: number;
    cleanliness: number;
    overall: number;
    comments?: string;
  };
  createdAt: string;
  updatedAt: string;
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
  estimatedArrival?: string;
}

interface NotificationTemplate {
  type: 'sms' | 'whatsapp';
  language: 'ta' | 'en';
  template: string;
}

const BookingManagementSystem: React.FC = () => {
  const { language, user } = useAuthStore();
  const queryClient = useQueryClient();
  
  // State management
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showSurveyModal, setShowSurveyModal] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    serviceType: 'all',
    priority: 'all',
    dateRange: 'today',
    search: ''
  });
  
  // Form states
  const [completionPhotos, setCompletionPhotos] = useState<string[]>([]);
  const [workSummary, setWorkSummary] = useState('');
  const [actualCost, setActualCost] = useState<number>(0);
  const [customerRating, setCustomerRating] = useState<number>(0);
  const [customerReview, setCustomerReview] = useState('');
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  // Refs
  const signatureRef = useRef<SignatureCanvas>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch bookings with filters
  const { data: bookings = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-bookings', filters],
    queryFn: async (): Promise<Booking[]> => {
      // Simulate API call with filters
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockBookings: Booking[] = [
        {
          id: 'BK001',
          customerId: 'C001',
          customerName: 'ராஜேஷ் குமார்',
          customerPhone: '9876543210',
          customerLanguage: 'ta',
          serviceType: 'electrical',
          title: 'விசிறி பழுது',
          description: 'வீட்டு விசிறி வேலை செய்யவில்லை. சத்தம் வருகிறது மற்றும் மெதுவாக சுழல்கிறது.',
          problemPhotos: ['/images/fan-problem1.jpg', '/images/fan-problem2.jpg'],
          status: 'pending',
          priority: 'emergency',
          scheduledTime: '2024-12-15T09:00:00',
          contactInfo: {
            address: '123, காந்தி சாலை, நாகர்கோயில் - 629001',
            location: { lat: 8.1778, lng: 77.4362 },
            landmarks: 'காந்தி சிலை அருகில்'
          },
          estimatedCost: 200,
          paymentStatus: 'pending',
          createdAt: '2024-12-14T20:30:00',
          updatedAt: '2024-12-14T20:30:00'
        },
        {
          id: 'BK002',
          customerId: 'C002',
          customerName: 'சுரேஷ் பிரியா',
          customerPhone: '9876543220',
          customerLanguage: 'ta',
          serviceType: 'plumbing',
          title: 'குழாய் கசிவு',
          description: 'குளியலறை குழாய் கசிகிறது. அதிக தண்ணீர் வீணாகிறது.',
          problemPhotos: ['/images/tap-leak.jpg'],
          status: 'in-progress',
          priority: 'urgent',
          scheduledTime: '2024-12-15T10:30:00',
          contactInfo: {
            address: '456, அண்ணா நகர், நாகர்கோயில்',
            location: { lat: 8.1745, lng: 77.4398 }
          },
          assignedTechnicianId: 'T002',
          assignedTechnician: {
            id: 'T002',
            name: 'ராமன் செல்வம்',
            phone: '9876543250',
            skills: ['plumbing', 'pipe-repair'],
            status: 'busy',
            currentLocation: { lat: 8.1745, lng: 77.4398, address: 'அண்ணா நகர்' },
            rating: 4.6,
            completedJobs: 98,
            estimatedArrival: '10:00 AM'
          },
          estimatedCost: 300,
          startTime: '2024-12-15T10:15:00',
          paymentStatus: 'pending',
          createdAt: '2024-12-14T19:15:00',
          updatedAt: '2024-12-15T10:15:00'
        },
        {
          id: 'BK003',
          customerId: 'C003',
          customerName: 'மாலா தேவி',
          customerPhone: '9876543230',
          customerLanguage: 'ta',
          serviceType: 'electrical',
          title: 'சுவிட்ச் பழுது',
          description: 'மின் சுவிட்ச் வேலை செய்யவில்லை',
          problemPhotos: [],
          status: 'completed',
          priority: 'normal',
          scheduledTime: '2024-12-14T14:00:00',
          contactInfo: {
            address: '789, ஜெய்நகர், நாகர்கோயில்'
          },
          assignedTechnicianId: 'T001',
          assignedTechnician: {
            id: 'T001',
            name: 'முருகன் குமார்',
            phone: '9876543240',
            skills: ['electrical'],
            status: 'available',
            rating: 4.8,
            completedJobs: 156
          },
          estimatedCost: 150,
          actualCost: 180,
          startTime: '2024-12-14T14:00:00',
          endTime: '2024-12-14T15:30:00',
          duration: 90,
          completionPhotos: ['/images/switch-after.jpg'],
          digitalSignature: 'data:image/png;base64,signature',
          paymentStatus: 'paid',
          rating: 5,
          review: 'மிகச்சிறந்த வேலை. நேரத்தில் வந்து சரியாக செய்தார்.',
          satisfactionSurvey: {
            timeliness: 5,
            quality: 5,
            communication: 4,
            cleanliness: 4,
            overall: 5,
            comments: 'எல்லாம் நன்றாக இருந்தது'
          },
          createdAt: '2024-12-13T16:45:00',
          updatedAt: '2024-12-14T15:30:00'
        }
      ];
      
      // Apply filters
      return mockBookings.filter(booking => {
        if (filters.status !== 'all' && booking.status !== filters.status) return false;
        if (filters.serviceType !== 'all' && booking.serviceType !== filters.serviceType) return false;
        if (filters.priority !== 'all' && booking.priority !== filters.priority) return false;
        if (filters.search && !booking.customerName.toLowerCase().includes(filters.search.toLowerCase()) 
            && !booking.id.toLowerCase().includes(filters.search.toLowerCase())) return false;
        
        // Date filtering
        const bookingDate = new Date(booking.scheduledTime);
        const today = new Date();
        if (filters.dateRange === 'today' && bookingDate.toDateString() !== today.toDateString()) return false;
        
        return true;
      });
    },
    refetchInterval: 30000
  });

  // Fetch available technicians
  const { data: availableTechnicians = [] } = useQuery({
    queryKey: ['available-technicians'],
    queryFn: async (): Promise<Technician[]> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return [
        {
          id: 'T001',
          name: 'முருகன் குமார்',
          phone: '9876543240',
          skills: ['electrical', 'fan-repair', 'wiring'],
          status: 'available',
          currentLocation: { lat: 8.1778, lng: 77.4362, address: 'காந்தி சாலை' },
          rating: 4.8,
          completedJobs: 156
        },
        {
          id: 'T002',
          name: 'ராமன் செல்வம்',
          phone: '9876543250',
          skills: ['plumbing', 'pipe-repair', 'toilet-repair'],
          status: 'busy',
          currentLocation: { lat: 8.1745, lng: 77.4398, address: 'அண்ணா நகர்' },
          rating: 4.6,
          completedJobs: 98
        },
        {
          id: 'T003',
          name: 'கிருஷ்ணன் ராஜ்',
          phone: '9876543260',
          skills: ['electrical', 'plumbing', 'emergency'],
          status: 'available',
          currentLocation: { lat: 8.1823, lng: 77.4287, address: 'ஜெய்நகர்' },
          rating: 4.9,
          completedJobs: 203
        }
      ];
    }
  });

  // Mutations
  const assignTechnicianMutation = useMutation({
    mutationFn: async ({ bookingId, technicianId }: { bookingId: string; technicianId: string }) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      setShowAssignmentModal(false);
      sendNotification('assignment_confirmed');
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ bookingId, status, data }: { bookingId: string; status: string; data?: any }) => {
      await new Promise(resolve => setTimeout(resolve, 800));
      return { success: true };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      if (variables.status === 'completed') {
        sendNotification('job_completed');
        setShowCompletionModal(false);
        setShowSurveyModal(true);
      }
    }
  });

  const emergencyEscalationMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true };
    },
    onSuccess: () => {
      sendNotification('emergency_escalated');
      refetch();
    }
  });

  // Notification system (simulated)
  const sendNotification = (type: string) => {
    const templates = {
      assignment_confirmed: {
        sms: {
          ta: 'உங்கள் பதிவு #{bookingId} க்கு தொழிலாளர் நியமிக்கப்பட்டுள்ளார். {technicianName} - {phone}',
          en: 'Technician assigned to booking #{bookingId}. {technicianName} - {phone}'
        },
        whatsapp: {
          ta: 'வணக்கம்! உங்கள் {serviceType} சேவைக்கு தொழிலாளர் நியமிக்கப்பட்டுள்ளார்.\n\nதொழிலாளர்: {technicianName}\nமொபைல்: {phone}\nவருகை நேரம்: {arrivalTime}\n\nநன்றி - நாஞ்சில் MEP',
          en: 'Hello! Technician assigned for your {serviceType} service.\n\nTechnician: {technicianName}\nPhone: {phone}\nArrival Time: {arrivalTime}\n\nThanks - Nanjil MEP'
        }
      },
      job_completed: {
        sms: {
          ta: 'உங்கள் {serviceType} பணி நிறைவடைந்தது. கட்டணம்: ₹{amount}. மதிப்பீடு தரவும்.',
          en: 'Your {serviceType} service completed. Amount: ₹{amount}. Please rate our service.'
        }
      },
      emergency_escalated: {
        sms: {
          ta: 'அவசர சேவை! எங்கள் டீம் 15 நிமிடத்தில் வந்துவிடும். தொடர்பு: 9876500000',
          en: 'Emergency service! Our team will arrive in 15 minutes. Contact: 9876500000'
        }
      }
    };

    // Simulate sending notification
    console.log(`📱 Notification sent: ${type}`);
  };

  // Helper functions
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    // Haversine formula for distance calculation
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const findBestTechnician = (booking: Booking): Technician | null => {
    if (!booking.contactInfo.location) return null;
    
    const availableSkilled = availableTechnicians.filter(tech => 
      tech.status === 'available' && 
      tech.skills.includes(booking.serviceType) &&
      tech.currentLocation
    );

    if (availableSkilled.length === 0) return null;

    // Sort by distance and rating
    const scored = availableSkilled.map(tech => {
      const distance = calculateDistance(
        booking.contactInfo.location!.lat,
        booking.contactInfo.location!.lng,
        tech.currentLocation!.lat,
        tech.currentLocation!.lng
      );
      const score = (tech.rating * 10) - distance; // Higher rating, closer distance = higher score
      return { ...tech, distance, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored[0];
  };

  const handleAutoAssign = (booking: Booking) => {
    const bestTechnician = findBestTechnician(booking);
    if (bestTechnician) {
      assignTechnicianMutation.mutate({
        bookingId: booking.id,
        technicianId: bestTechnician.id
      });
    }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            setCompletionPhotos(prev => [...prev, e.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleCompleteBooking = () => {
    if (!selectedBooking) return;

    const signature = signatureRef.current?.toDataURL();
    const completionData = {
      actualCost,
      workSummary,
      completionPhotos,
      digitalSignature: signature,
      duration: elapsedTime
    };

    updateStatusMutation.mutate({
      bookingId: selectedBooking.id,
      status: 'completed',
      data: completionData
    });
  };

  const startTimer = () => {
    setIsTimerRunning(true);
    const startTime = Date.now() - (elapsedTime * 1000);
    
    const timer = setInterval(() => {
      if (!isTimerRunning) {
        clearInterval(timer);
        return;
      }
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const renderBookingList = () => (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {language === 'ta' ? 'நிலை' : 'Status'}
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="all">{language === 'ta' ? 'எல்லாம்' : 'All'}</option>
                <option value="pending">{language === 'ta' ? 'காத்திருக்கும்' : 'Pending'}</option>
                <option value="confirmed">{language === 'ta' ? 'உறுதி' : 'Confirmed'}</option>
                <option value="in-progress">{language === 'ta' ? 'நடைபெறுகிறது' : 'In Progress'}</option>
                <option value="completed">{language === 'ta' ? 'முடிந்தது' : 'Completed'}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {language === 'ta' ? 'சேவை வகை' : 'Service Type'}
              </label>
              <select
                value={filters.serviceType}
                onChange={(e) => setFilters({...filters, serviceType: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="all">{language === 'ta' ? 'எல்லாம்' : 'All'}</option>
                <option value="electrical">{language === 'ta' ? 'மின்சாரம்' : 'Electrical'}</option>
                <option value="plumbing">{language === 'ta' ? 'குழாய்' : 'Plumbing'}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {language === 'ta' ? 'முன்னுரிமை' : 'Priority'}
              </label>
              <select
                value={filters.priority}
                onChange={(e) => setFilters({...filters, priority: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="all">{language === 'ta' ? 'எல்லாம்' : 'All'}</option>
                <option value="emergency">{language === 'ta' ? 'அவசரம்' : 'Emergency'}</option>
                <option value="urgent">{language === 'ta' ? 'அவசரம்' : 'Urgent'}</option>
                <option value="normal">{language === 'ta' ? 'சாதாரணம்' : 'Normal'}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {language === 'ta' ? 'தேதி' : 'Date'}
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="today">{language === 'ta' ? 'இன்று' : 'Today'}</option>
                <option value="tomorrow">{language === 'ta' ? 'நாளை' : 'Tomorrow'}</option>
                <option value="week">{language === 'ta' ? 'இந்த வாரம்' : 'This Week'}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {language === 'ta' ? 'தேடு' : 'Search'}
              </label>
              <div className="flex">
                <Input
                  placeholder={language === 'ta' ? 'பெயர் அல்லது ID' : 'Name or ID'}
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                />
                <Button variant="secondary" size="sm" className="ml-2">
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Booking Cards */}
      <div className="space-y-4">
        {isLoading ? (
          [1, 2, 3].map(i => (
            <Card key={i} className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </Card>
          ))
        ) : bookings.length === 0 ? (
          <Card className="p-8 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className={`text-lg text-gray-600 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
              {language === 'ta' ? 'பதிவுகள் கிடைக்கவில்லை' : 'No bookings found'}
            </p>
          </Card>
        ) : (
          bookings.map((booking) => (
            <Card key={booking.id} className={`hover:shadow-md transition-shadow cursor-pointer ${
              booking.priority === 'emergency' ? 'border-red-500 bg-red-50' :
              booking.priority === 'urgent' ? 'border-yellow-500 bg-yellow-50' : ''
            }`}>
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
                      <h3 className="text-lg font-bold">{booking.title}</h3>
                      <p className="text-gray-600">#{booking.id}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <StatusBadge variant={
                      booking.priority === 'emergency' ? 'emergency' :
                      booking.status === 'pending' ? 'pending' :
                      booking.status === 'confirmed' ? 'confirmed' :
                      booking.status === 'in-progress' ? 'in-progress' :
                      booking.status === 'completed' ? 'completed' : 'cancelled'
                    }>
                      {booking.priority === 'emergency' && '🚨 '}
                      {language === 'ta' ? (
                        booking.status === 'pending' ? 'காத்திருக்கும்' :
                        booking.status === 'confirmed' ? 'உறுதி' :
                        booking.status === 'in-progress' ? 'நடைபெறுகிறது' :
                        booking.status === 'completed' ? 'முடிந்தது' : 'இரத்து'
                      ) : booking.status}
                    </StatusBadge>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 mb-4 text-sm">
                  <div className="flex items-center text-gray-600">
                    <User className="w-4 h-4 mr-2" />
                    <span>{booking.customerName}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Phone className="w-4 h-4 mr-2" />
                    <span>{booking.customerPhone}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>
                      {new Date(booking.scheduledTime).toLocaleString(
                        booking.customerLanguage === 'ta' ? 'ta-IN' : 'en-IN'
                      )}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span className="truncate">{booking.contactInfo.address}</span>
                  </div>
                </div>

                {booking.assignedTechnician && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <UserCheck className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">
                          {booking.assignedTechnician.name}
                        </span>
                        <span className="text-xs text-green-600">
                          ({booking.assignedTechnician.rating}⭐)
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(`tel:+91${booking.assignedTechnician!.phone}`);
                          }}
                          size="sm"
                          variant="secondary"
                          className="text-xs"
                        >
                          <Phone className="w-3 h-3" />
                        </Button>
                        {booking.assignedTechnician.currentLocation && (
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              const url = `https://maps.google.com/?q=${booking.assignedTechnician!.currentLocation!.lat},${booking.assignedTechnician!.currentLocation!.lng}`;
                              window.open(url, '_blank');
                            }}
                            size="sm"
                            variant="secondary"
                            className="text-xs"
                          >
                            <Navigation className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <span className="text-gray-600">
                      {language === 'ta' ? 'மதிப்பிடப்பட்ட விலை:' : 'Estimated cost:'}
                    </span>
                    <span className="font-medium text-green-600 ml-1">₹{booking.estimatedCost}</span>
                  </div>

                  <div className="flex space-x-2">
                    {booking.priority === 'emergency' && booking.status === 'pending' && (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          emergencyEscalationMutation.mutate(booking.id);
                        }}
                        size="sm"
                        variant="emergency"
                        className="text-xs animate-pulse"
                      >
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        {language === 'ta' ? 'அவசர நடவடிக்கை' : 'Escalate'}
                      </Button>
                    )}

                    {booking.status === 'pending' && !booking.assignedTechnicianId && (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedBooking(booking);
                          setShowAssignmentModal(true);
                        }}
                        size="sm"
                        variant="secondary"
                        className="text-xs"
                      >
                        <UserCheck className="w-3 h-3 mr-1" />
                        {language === 'ta' ? 'நியமி' : 'Assign'}
                      </Button>
                    )}

                    {booking.status === 'in-progress' && (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedBooking(booking);
                          setShowCompletionModal(true);
                        }}
                        size="sm"
                        variant="secondary"
                        className="text-xs bg-blue-500 text-white hover:bg-blue-600"
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {language === 'ta' ? 'முடிப்பு' : 'Complete'}
                      </Button>
                    )}

                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedBooking(booking);
                        setShowDetailModal(true);
                      }}
                      size="sm"
                      variant="secondary"
                      className="text-xs"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      {language === 'ta' ? 'பார்' : 'View'}
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

  const renderDetailModal = () => {
    if (!selectedBooking) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-bold">
              {language === 'ta' ? 'பதிவு விபரங்கள்' : 'Booking Details'}
            </CardTitle>
            <Button
              onClick={() => setShowDetailModal(false)}
              variant="secondary"
              size="sm"
            >
              ✕
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Customer Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-bold mb-3 flex items-center">
                <User className="w-5 h-5 mr-2" />
                {language === 'ta' ? 'வாடிக்கையாளர் விபரங்கள்' : 'Customer Information'}
              </h3>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">{language === 'ta' ? 'பெயர்:' : 'Name:'}</span>
                  <p>{selectedBooking.customerName}</p>
                </div>
                <div>
                  <span className="font-medium">{language === 'ta' ? 'மொபைல்:' : 'Phone:'}</span>
                  <p>{selectedBooking.customerPhone}</p>
                </div>
                <div className="sm:col-span-2">
                  <span className="font-medium">{language === 'ta' ? 'முகவரி:' : 'Address:'}</span>
                  <p>{selectedBooking.contactInfo.address}</p>
                  {selectedBooking.contactInfo.landmarks && (
                    <p className="text-gray-600">
                      {language === 'ta' ? 'அடையாளம்:' : 'Landmarks:'} {selectedBooking.contactInfo.landmarks}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Problem Description */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-bold mb-3 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                {language === 'ta' ? 'பிரச்சனை விவரம்' : 'Problem Description'}
              </h3>
              <p className="mb-3">{selectedBooking.description}</p>
              
              {selectedBooking.problemPhotos.length > 0 && (
                <div>
                  <span className="font-medium text-sm">
                    {language === 'ta' ? 'பிரச்சனை புகைப்படங்கள்:' : 'Problem Photos:'}
                  </span>
                  <div className="flex space-x-2 mt-2">
                    {selectedBooking.problemPhotos.map((photo, index) => (
                      <img
                        key={index}
                        src={photo}
                        alt={`Problem ${index + 1}`}
                        className="w-20 h-20 object-cover rounded border cursor-pointer"
                        onClick={() => window.open(photo, '_blank')}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Service Timeline */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-bold mb-3 flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                {language === 'ta' ? 'சேவை நேரக்கோடு' : 'Service Timeline'}
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div className="text-sm">
                    <span className="font-medium">
                      {language === 'ta' ? 'பதிவு செய்யப்பட்டது:' : 'Booked:'}
                    </span>
                    <span className="ml-2">
                      {new Date(selectedBooking.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    selectedBooking.scheduledTime ? 'bg-green-500' : 'bg-gray-300'
                  }`}></div>
                  <div className="text-sm">
                    <span className="font-medium">
                      {language === 'ta' ? 'திட்டமிடப்பட்ட நேரம்:' : 'Scheduled:'}
                    </span>
                    <span className="ml-2">
                      {new Date(selectedBooking.scheduledTime).toLocaleString()}
                    </span>
                  </div>
                </div>

                {selectedBooking.startTime && (
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="text-sm">
                      <span className="font-medium">
                        {language === 'ta' ? 'வேலை தொடங்கியது:' : 'Work Started:'}
                      </span>
                      <span className="ml-2">
                        {new Date(selectedBooking.startTime).toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}

                {selectedBooking.endTime && (
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div className="text-sm">
                      <span className="font-medium">
                        {language === 'ta' ? 'வேலை முடிந்தது:' : 'Work Completed:'}
                      </span>
                      <span className="ml-2">
                        {new Date(selectedBooking.endTime).toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Technician Details */}
            {selectedBooking.assignedTechnician && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-bold mb-3 flex items-center">
                  <UserCheck className="w-5 h-5 mr-2" />
                  {language === 'ta' ? 'தொழிலாளர் விபரங்கள்' : 'Assigned Technician'}
                </h3>
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">{language === 'ta' ? 'பெயர்:' : 'Name:'}</span>
                    <p>{selectedBooking.assignedTechnician.name}</p>
                  </div>
                  <div>
                    <span className="font-medium">{language === 'ta' ? 'மொபைல்:' : 'Phone:'}</span>
                    <p>{selectedBooking.assignedTechnician.phone}</p>
                  </div>
                  <div>
                    <span className="font-medium">{language === 'ta' ? 'மதிப்பீடு:' : 'Rating:'}</span>
                    <p>{selectedBooking.assignedTechnician.rating}⭐</p>
                  </div>
                  <div>
                    <span className="font-medium">{language === 'ta' ? 'முடிந்த வேலைகள்:' : 'Completed Jobs:'}</span>
                    <p>{selectedBooking.assignedTechnician.completedJobs}</p>
                  </div>
                </div>
                
                <div className="flex space-x-2 mt-3">
                  <Button
                    onClick={() => window.open(`tel:+91${selectedBooking.assignedTechnician!.phone}`)}
                    size="sm"
                    className="bg-green-500 text-white hover:bg-green-600"
                  >
                    <Phone className="w-4 h-4 mr-1" />
                    {language === 'ta' ? 'அழை' : 'Call'}
                  </Button>
                  <Button
                    onClick={() => {
                      const message = language === 'ta'
                        ? `வணக்கம்! பதிவு எண் ${selectedBooking.id} பற்றி விசாரிக்க வேண்டும்.`
                        : `Hello! Regarding booking #${selectedBooking.id}`;
                      window.open(`https://wa.me/91${selectedBooking.assignedTechnician!.phone}?text=${encodeURIComponent(message)}`, '_blank');
                    }}
                    size="sm"
                    className="bg-green-500 text-white hover:bg-green-600"
                  >
                    <MessageCircle className="w-4 h-4 mr-1" />
                    WhatsApp
                  </Button>
                </div>
              </div>
            )}

            {/* Completion Details */}
            {selectedBooking.status === 'completed' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-bold mb-3 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  {language === 'ta' ? 'வேலை முடிப்பு விபரங்கள்' : 'Completion Details'}
                </h3>
                
                <div className="grid sm:grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <span className="font-medium">{language === 'ta' ? 'செலவு:' : 'Final Cost:'}</span>
                    <p className="text-green-600 font-bold">₹{selectedBooking.actualCost}</p>
                  </div>
                  <div>
                    <span className="font-medium">{language === 'ta' ? 'நேரம்:' : 'Duration:'}</span>
                    <p>{selectedBooking.duration} {language === 'ta' ? 'நிமிடங்கள்' : 'minutes'}</p>
                  </div>
                </div>

                {selectedBooking.completionPhotos && selectedBooking.completionPhotos.length > 0 && (
                  <div className="mb-4">
                    <span className="font-medium text-sm">
                      {language === 'ta' ? 'வேலை முடிப்பு புகைப்படங்கள்:' : 'Completion Photos:'}
                    </span>
                    <div className="flex space-x-2 mt-2">
                      {selectedBooking.completionPhotos.map((photo, index) => (
                        <img
                          key={index}
                          src={photo}
                          alt={`Completion ${index + 1}`}
                          className="w-20 h-20 object-cover rounded border cursor-pointer"
                          onClick={() => window.open(photo, '_blank')}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {selectedBooking.rating && (
                  <div className="bg-white rounded p-3 border">
                    <div className="flex items-center mb-2">
                      <Star className="w-5 h-5 text-yellow-500 fill-current mr-1" />
                      <span className="font-medium">{selectedBooking.rating}/5</span>
                    </div>
                    {selectedBooking.review && (
                      <p className="text-sm italic">"{selectedBooking.review}"</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button
                onClick={() => {
                  const message = language === 'ta'
                    ? `பதிவு எண்: ${selectedBooking.id}\nசேவை: ${selectedBooking.title}\nவாடிக்கையாளர்: ${selectedBooking.customerName}\nநிலை: ${selectedBooking.status}`
                    : `Booking ID: ${selectedBooking.id}\nService: ${selectedBooking.title}\nCustomer: ${selectedBooking.customerName}\nStatus: ${selectedBooking.status}`;
                  
                  const whatsappUrl = `https://wa.me/91${selectedBooking.customerPhone}?text=${encodeURIComponent(message)}`;
                  window.open(whatsappUrl, '_blank');
                }}
                variant="secondary"
                size="sm"
                className="bg-green-500 text-white hover:bg-green-600"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                {language === 'ta' ? 'வாடிக்கையாளருக்கு WhatsApp' : 'WhatsApp Customer'}
              </Button>
              
              {selectedBooking.status === 'pending' && !selectedBooking.assignedTechnicianId && (
                <Button
                  onClick={() => {
                    setShowDetailModal(false);
                    setShowAssignmentModal(true);
                  }}
                  size="sm"
                >
                  <UserCheck className="w-4 h-4 mr-2" />
                  {language === 'ta' ? 'தொழிலாளர் நியமி' : 'Assign Technician'}
                </Button>
              )}

              {selectedBooking.status === 'in-progress' && (
                <Button
                  onClick={() => {
                    setShowDetailModal(false);
                    setShowCompletionModal(true);
                  }}
                  size="sm"
                  className="bg-blue-500 text-white hover:bg-blue-600"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {language === 'ta' ? 'வேலை முடிப்பு' : 'Mark Complete'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderAssignmentModal = () => {
    if (!selectedBooking) return null;

    const suitableTechnicians = availableTechnicians
      .filter(tech => 
        tech.skills.includes(selectedBooking.serviceType) &&
        (selectedBooking.priority === 'emergency' || tech.status === 'available')
      )
      .map(tech => {
        if (!selectedBooking.contactInfo.location || !tech.currentLocation) {
          return { ...tech, distance: 0 };
        }
        const distance = calculateDistance(
          selectedBooking.contactInfo.location.lat,
          selectedBooking.contactInfo.location.lng,
          tech.currentLocation.lat,
          tech.currentLocation.lng
        );
        return { ...tech, distance };
      })
      .sort((a, b) => a.distance - b.distance);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-2xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              {language === 'ta' ? 'தொழிலாளர் நியமிப்பு' : 'Assign Technician'}
            </CardTitle>
            <Button
              onClick={() => setShowAssignmentModal(false)}
              variant="secondary"
              size="sm"
            >
              ✕
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-bold mb-2">{selectedBooking.title}</h3>
              <p className="text-sm text-gray-600">{selectedBooking.customerName} - {selectedBooking.customerPhone}</p>
              <p className="text-sm">{selectedBooking.contactInfo.address}</p>
            </div>

            {selectedBooking.priority === 'emergency' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center text-red-800">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  <span className="font-medium">
                    {language === 'ta' ? '🚨 அவசர சேவை - உடனடி நடவடிக்கை தேவை' : '🚨 Emergency Service - Immediate Action Required'}
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">
                  {language === 'ta' ? 'கிடைக்கும் தொழிலாளர்கள்:' : 'Available Technicians:'}
                </h4>
                <Button
                  onClick={() => handleAutoAssign(selectedBooking)}
                  size="sm"
                  variant="secondary"
                >
                  <Zap className="w-4 h-4 mr-1" />
                  {language === 'ta' ? 'தானாக நியமி' : 'Auto Assign'}
                </Button>
              </div>

              {suitableTechnicians.map((tech) => (
                <Card key={tech.id} className="p-4 hover:shadow-md cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        tech.status === 'available' ? 'bg-green-500' :
                        tech.status === 'busy' ? 'bg-yellow-500' : 'bg-gray-500'
                      }`}></div>
                      <div>
                        <h5 className="font-medium">{tech.name}</h5>
                        <p className="text-sm text-gray-600">{tech.phone}</p>
                        <div className="flex items-center text-sm">
                          <Star className="w-3 h-3 text-yellow-500 fill-current mr-1" />
                          <span>{tech.rating}</span>
                          <span className="text-gray-500 ml-2">({tech.completedJobs} jobs)</span>
                          {tech.distance > 0 && (
                            <span className="text-gray-500 ml-2">
                              • {tech.distance.toFixed(1)}km away
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {tech.skills.map(skill => (
                            <span key={skill} className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => window.open(`tel:+91${tech.phone}`)}
                        size="sm"
                        variant="secondary"
                      >
                        <Phone className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => assignTechnicianMutation.mutate({
                          bookingId: selectedBooking.id,
                          technicianId: tech.id
                        })}
                        size="sm"
                        disabled={assignTechnicianMutation.isPending}
                      >
                        {assignTechnicianMutation.isPending ? (
                          language === 'ta' ? 'நியமிக்கிறது...' : 'Assigning...'
                        ) : (
                          language === 'ta' ? 'நியமி' : 'Assign'
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}

              {suitableTechnicians.length === 0 && (
                <div className="text-center py-8">
                  <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    {language === 'ta' ? 'தகுந்த தொழிலாளர்கள் கிடைக்கவில்லை' : 'No suitable technicians available'}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderCompletionModal = () => {
    if (!selectedBooking) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
        <Card className="w-full max-w-2xl my-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              {language === 'ta' ? 'வேலை முடிப்பு' : 'Complete Job'}
            </CardTitle>
            <Button
              onClick={() => setShowCompletionModal(false)}
              variant="secondary"
              size="sm"
            >
              ✕
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Time Tracking */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold flex items-center">
                  <Timer className="w-5 h-5 mr-2" />
                  {language === 'ta' ? 'நேர கண்காணிப்பு' : 'Time Tracking'}
                </h3>
                <div className="text-2xl font-bold text-blue-600">
                  {formatTime(elapsedTime)}
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={startTimer}
                  size="sm"
                  variant="secondary"
                  disabled={isTimerRunning}
                >
                  <Play className="w-4 h-4 mr-1" />
                  {language === 'ta' ? 'தொடங்கு' : 'Start'}
                </Button>
                <Button
                  onClick={() => setIsTimerRunning(false)}
                  size="sm"
                  variant="secondary"
                  disabled={!isTimerRunning}
                >
                  <Pause className="w-4 h-4 mr-1" />
                  {language === 'ta' ? 'நிறுத்து' : 'Pause'}
                </Button>
                <Button
                  onClick={() => {
                    setIsTimerRunning(false);
                    setElapsedTime(0);
                  }}
                  size="sm"
                  variant="secondary"
                >
                  <Square className="w-4 h-4 mr-1" />
                  {language === 'ta' ? 'மீட்டமை' : 'Reset'}
                </Button>
              </div>
            </div>

            {/* Work Summary */}
            <div>
              <label className="block text-sm font-medium mb-2">
                {language === 'ta' ? 'வேலை சுருக்கம்:' : 'Work Summary:'}
              </label>
              <Textarea
                value={workSummary}
                onChange={(e) => setWorkSummary(e.target.value)}
                placeholder={language === 'ta' 
                  ? 'செய்யப்பட்ட வேலைகளை விவரிக்கவும்...'
                  : 'Describe the work completed...'
                }
                rows={4}
              />
            </div>

            {/* Actual Cost */}
            <div>
              <label className="block text-sm font-medium mb-2">
                {language === 'ta' ? 'உண்மையான செலவு:' : 'Actual Cost:'}
              </label>
              <Input
                type="number"
                value={actualCost}
                onChange={(e) => setActualCost(Number(e.target.value))}
                placeholder="0"
                className="text-lg"
              />
              <p className="text-sm text-gray-600 mt-1">
                {language === 'ta' ? 'மதிப்பிடப்பட்டது:' : 'Estimated:'} ₹{selectedBooking.estimatedCost}
              </p>
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-medium mb-2">
                {language === 'ta' ? 'வேலை முடிப்பு புகைப்படங்கள்:' : 'Completion Photos:'}
              </label>
              <div className="space-y-3">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="secondary"
                  size="sm"
                  className="w-full"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  {language === 'ta' ? 'புகைப்படம் சேர்' : 'Add Photos'}
                </Button>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                />

                {completionPhotos.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {completionPhotos.map((photo, index) => (
                      <div key={index} className="relative">
                        <img
                          src={photo}
                          alt={`Completion ${index + 1}`}
                          className="w-full h-24 object-cover rounded border"
                        />
                        <button
                          onClick={() => setCompletionPhotos(prev => 
                            prev.filter((_, i) => i !== index)
                          )}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Before/After Comparison */}
                {selectedBooking.problemPhotos.length > 0 && completionPhotos.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium mb-2">
                      {language === 'ta' ? 'முன்/பின் ஒப்பீடு' : 'Before/After Comparison'}
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-600">
                          {language === 'ta' ? 'முன்' : 'Before'}
                        </span>
                        <img
                          src={selectedBooking.problemPhotos[0]}
                          alt="Before"
                          className="w-full h-32 object-cover rounded border mt-1"
                        />
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">
                          {language === 'ta' ? 'பின்' : 'After'}
                        </span>
                        <img
                          src={completionPhotos[0]}
                          alt="After"
                          className="w-full h-32 object-cover rounded border mt-1"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Digital Signature */}
            <div>
              <label className="block text-sm font-medium mb-2">
                {language === 'ta' ? 'வாடிக்கையாளர் கையெழுத்து:' : 'Customer Signature:'}
              </label>
              <div className="border-2 border-gray-300 rounded-lg p-2">
                <SignatureCanvas
                  ref={signatureRef}
                  canvasProps={{
                    width: 400,
                    height: 150,
                    className: 'signature-canvas w-full border rounded'
                  }}
                />
              </div>
              <div className="flex justify-between mt-2">
                <Button
                  onClick={() => signatureRef.current?.clear()}
                  size="sm"
                  variant="secondary"
                >
                  {language === 'ta' ? 'அழி' : 'Clear'}
                </Button>
                <span className="text-xs text-gray-600">
                  {language === 'ta' ? 'வாடிக்கையாளர் இங்கே கையெழுத்திடவும்' : 'Customer signature required'}
                </span>
              </div>
            </div>

            {/* Customer Rating */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-bold mb-3 flex items-center">
                <Star className="w-5 h-5 mr-2" />
                {language === 'ta' ? 'வாடிக்கையாளர் மதிப்பீடு' : 'Customer Rating'}
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {language === 'ta' ? 'மதிப்பீடு:' : 'Rating:'}
                  </label>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setCustomerRating(star)}
                        className={`w-8 h-8 ${
                          star <= customerRating 
                            ? 'text-yellow-400 fill-current' 
                            : 'text-gray-300'
                        }`}
                      >
                        <Star className="w-6 h-6" />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {language === 'ta' ? 'கருத்து:' : 'Review:'}
                  </label>
                  <Textarea
                    value={customerReview}
                    onChange={(e) => setCustomerReview(e.target.value)}
                    placeholder={language === 'ta' 
                      ? 'வாடிக்கையாளர் கருத்து...'
                      : 'Customer feedback...'
                    }
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-4 border-t">
              <Button
                onClick={() => setShowCompletionModal(false)}
                variant="secondary"
              >
                {language === 'ta' ? 'ரத்து செய்' : 'Cancel'}
              </Button>
              
              <div className="flex space-x-2">
                <Button
                  onClick={() => {
                    // Send completion notification
                    sendNotification('job_completed');
                  }}
                  variant="secondary"
                  size="sm"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {language === 'ta' ? 'அறிவிப்பு அனுப்பு' : 'Send Notification'}
                </Button>
                
                <Button
                  onClick={handleCompleteBooking}
                  disabled={!workSummary || !actualCost || completionPhotos.length === 0}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {language === 'ta' ? 'வேலை முடி' : 'Complete Job'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderSurveyModal = () => {
    if (!selectedBooking) return null;

    const [surveyData, setSurveyData] = useState({
      timeliness: 0,
      quality: 0,
      communication: 0,
      cleanliness: 0,
      overall: 0,
      comments: '',
      wouldRecommend: false
    });

    const handleSurveySubmit = () => {
      // Simulate API call to save survey
      console.log('Survey submitted:', surveyData);
      setShowSurveyModal(false);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              {language === 'ta' ? 'வாடிக்கையாளர் திருப்தி கருத்துக்கணிப்பு' : 'Customer Satisfaction Survey'}
            </CardTitle>
            <Button
              onClick={() => setShowSurveyModal(false)}
              variant="secondary"
              size="sm"
            >
              ✕
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              {language === 'ta' 
                ? 'வாடிக்கையாளருக்கு இந்த கருத்துக்கணிப்பு SMS மூலம் அனுப்பப்படும்'
                : 'This survey will be sent to the customer via SMS'
              }
            </p>

            <div className="space-y-4">
              {[
                { key: 'timeliness', label: language === 'ta' ? 'நேரத்தில் வருகை' : 'Timeliness' },
                { key: 'quality', label: language === 'ta' ? 'வேலையின் தரம்' : 'Work Quality' },
                { key: 'communication', label: language === 'ta' ? 'தொடர்பு' : 'Communication' },
                { key: 'cleanliness', label: language === 'ta' ? 'சுத்தம்' : 'Cleanliness' }
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{item.label}:</span>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
  key={star}
  onClick={() => setSurveyData(prev => ({...prev, [item.key]: star}))}
  className={`w-6 h-6 ${
    star <= Number(surveyData[item.key as keyof typeof surveyData] ?? 0)
      ? 'text-yellow-400 fill-current'
      : 'text-gray-300'
  }`}
>
  <Star className="w-4 h-4" />
</button>

                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {language === 'ta' ? 'ஒட்டுமொத்த மதிப்பீடு:' : 'Overall Rating:'}
              </label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setSurveyData(prev => ({...prev, overall: star}))}
                    className={`w-8 h-8 ${
                      star <= surveyData.overall 
                        ? 'text-yellow-400 fill-current' 
                        : 'text-gray-300'
                    }`}
                  >
                    <Star className="w-6 h-6" />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="recommend"
                checked={surveyData.wouldRecommend}
                onChange={(e) => setSurveyData(prev => ({...prev, wouldRecommend: e.target.checked}))}
                className="rounded"
              />
              <label htmlFor="recommend" className="text-sm">
                {language === 'ta' 
                  ? 'பிறருக்கு பரிந்துரைப்பார்களா?'
                  : 'Would recommend to others?'
                }
              </label>
            </div>

            <div className="flex justify-between pt-4">
              <Button
                onClick={() => setShowSurveyModal(false)}
                variant="secondary"
              >
                {language === 'ta' ? 'பின்னர்' : 'Skip'}
              </Button>
              
              <Button
                onClick={handleSurveySubmit}
                className="bg-green-500 text-white hover:bg-green-600"
              >
                <Send className="w-4 h-4 mr-2" />
                {language === 'ta' ? 'கருத்துக்கணிப்பு அனுப்பு' : 'Send Survey'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

    function handleExportReport(type: 'technicians' | 'bookings' | 'revenue') {
  console.log(`Exporting ${type} report`);
}

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className={`text-3xl font-bold ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
          {language === 'ta' ? 'பதிவுகள் மேலாண்மை' : 'Booking Management'}
        </h1>
        
        <div className="flex space-x-2">
          <Button
            onClick={() => refetch()}
            variant="secondary"
            size="sm"
          >
            <Bell className="w-4 h-4 mr-2" />
            {language === 'ta' ? 'புதுப்பி' : 'Refresh'}
          </Button>
          
          <Button
            onClick={() => handleExportReport('bookings')}
            variant="secondary"
            size="sm"
          >
            <Download className="w-4 h-4 mr-2" />
            {language === 'ta' ? 'ஏற்றுமதி' : 'Export'}
          </Button>
        </div>
      </div>

      {renderBookingList()}
      {showDetailModal && renderDetailModal()}
      {showAssignmentModal && renderAssignmentModal()}
      {showCompletionModal && renderCompletionModal()}
      {showSurveyModal && renderSurveyModal()}
    </div>
  );
};