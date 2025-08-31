'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { SignInButton, SignUpButton, SignedIn, SignedOut } from '@clerk/nextjs';
import { 
  Phone, 
  MapPin, 
  Mic, 
  Globe, 
  Zap, 
  Wrench, 
  AlertTriangle, 
  Star, 
  Clock, 
  Users,
  Droplets,
  ArrowRight,
  MessageCircle,
  LogOut,
  User,
  Shield,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

// Types and Interfaces
type Language = 'ta' | 'en';
type ServiceType = 'electrical' | 'plumbing';

interface Location {
  lat: number;
  lng: number;
  address?: string;
}

interface ServiceCard {
  id: string;
  type: ServiceType;
  name_ta: string;
  name_en: string;
  icon: React.ReactNode;
  color: string;
  services: {
    ta: string[];
    en: string[];
  };
  description_ta: string;
  description_en: string;
}

// Main Component
const LandingPage: React.FC = () => {
  const router = useRouter();
  const { user, isLoading, isSignedIn, isAdmin, logout, goToDashboard } = useAuth();
  const [language, setLanguage] = useState<Language>('ta');
  const [location, setLocation] = useState<Location | null>(null);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [isClient, setIsClient] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Fixed: Move greeting function outside of translations to prevent re-creation
  const getGreeting = useCallback((time: Date, lang: Language): string => {
    const hour = time.getHours();
    if (lang === 'ta') {
      return hour < 12 ? 'காலை வணக்கம்' : hour < 18 ? 'மதிய வணக்கம்' : 'மாலை வணக்கம்';
    } else {
      return hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';
    }
  }, []);

  // Fixed: Memoize translations to prevent re-creation
  const translations = useMemo(() => ({
    ta: {
      title: "நாஞ்சில் MEP சேவை",
      subtitle: "மின்சாரம் • குழாய் • அவசர சேவை",
      tagline: "உங்கள் வீட்டின் நம்பகமான சேவை கூட்டாளர்",
      whichService: "எந்த சேவை வேண்டும்?",
      bookService: "சேவை பதிவு செய்க",
      emergency: "அவசரம்",
      available24x7: "24 மணி நேரம் கிடைக்கும்",
      callNow: "உடனே அழைக்கவும்",
      immediateService: "உடனடி சேவை",
      voiceSearch: "குரல் மூலம் பேசுங்கள்",
      listening: "கேட்டுக்கொண்டிருக்கிறது...",
      speak: "பேசுங்கள்",
      electrical: "மின்சாரம்",
      plumbing: "குழாய்",
      electricalDesc: "மின் சம்பந்தமான அனைத்து பணிகளும்",
      plumbingDesc: "தண்ணீர் மற்றும் குழாய் சம்பந்தமான பணிகளும்",
      myBookings: "எனது பதிவுகள்",
      products: "பொருட்கள்",
      contact: "தொடர்பு",
      whyChooseUs: "ஏன் எங்களை தேர்வு செய்ய வேண்டும்?",
      experienced: "அனுபவமிக்க வல்லுநர்கள்",
      quickResponse: "விரைவான பதிலளிப்பு",
      qualityWork: "தரமான வேலை",
      available247: "24x7 கிடைக்கும்",
      years8Plus: "8+ ஆண்டுகள் அனுபவம்",
      mins30: "30 நிமிடத்தில் வருகை",
      rating46: "4.6 நட்சத்திர மதிப்பீடு",
      emergencyService: "அவசர சேவை",
      serviceHours: "சேவை நேரம்",
      regularService: "வழக்கமான சேவை:",
      morningToEvening: "காலை 8:00 - மாலை 8:00",
      emergency247: "அவசர சேவை: 24 மணி நேரம்",
      happyCustomers: "திருப்தியான வாடிக்கையாளர்கள்",
      reviews: "மதிப்பீடுகள்",
      trustedPartner: "நம்பகமான சேவை கூட்டாளர்",
      servingAreas: "நாகர்கோவில் மற்றும் சுற்றுப்புற பகுதிகளில் சேவை",
      welcome: "வணக்கம்",
      logout: "வெளியேறு",
      dashboard: "கட்டுப்பாட்டு பலகை",
      login: "உள்நுழை",
      signup: "பதிவு செய்",
      bookNow: "இப்போது பதிவு செய்",
      loginToBook: "பதிவுக்கு உள்நுழையவும்",
      loginRequired: "உள்நுழைவு தேவை",
      getStarted: "தொடங்கவும்",
      menu: "மெனு"
    },
    en: {
      title: "Nanjil MEP Service",
      subtitle: "Electrical • Plumbing • Emergency Service",
      tagline: "Your Home's Trusted Service Partner",
      whichService: "Which service do you need?",
      bookService: "Book Service",
      emergency: "EMERGENCY",
      available24x7: "Available 24x7",
      callNow: "Call Now",
      immediateService: "Immediate Service",
      voiceSearch: "Voice Search",
      listening: "Listening...",
      speak: "Speak",
      electrical: "ELECTRICAL",
      plumbing: "PLUMBING", 
      electricalDesc: "All electrical related services",
      plumbingDesc: "All water and plumbing services",
      myBookings: "My Bookings",
      products: "Products", 
      contact: "Contact",
      whyChooseUs: "Why Choose Us?",
      experienced: "Expert Technicians",
      quickResponse: "Quick Response",
      qualityWork: "Quality Work",
      available247: "24x7 Available",
      years8Plus: "8+ years experience",
      mins30: "Arrive within 30 min",
      rating46: "4.6 star rating",
      emergencyService: "Emergency service",
      serviceHours: "Service Hours",
      regularService: "Regular Service:",
      morningToEvening: "8:00 AM - 8:00 PM",
      emergency247: "Emergency Service: 24 Hours",
      happyCustomers: "Happy Customers",
      reviews: "Reviews",
      trustedPartner: "Trusted Service Partner",
      servingAreas: "Serving Nagercoil and surrounding areas",
      welcome: "Welcome",
      logout: "Logout",
      dashboard: "Dashboard",
      login: "Login",
      signup: "Sign Up",
      bookNow: "Book Now",
      loginToBook: "Login to Book",
      loginRequired: "Login required",
      getStarted: "Get Started",
      menu: "Menu"
    }
  }), []);

  const currentT = translations[language];

  // Fixed: Initialize client-side only (removed user dependency)
  useEffect(() => {
    setIsClient(true);
    setCurrentTime(new Date());
  }, []);

  // Fixed: Set language when user data loads (separate effect)
  useEffect(() => {
    if (user?.language && (user.language === 'ta' || user.language === 'en')) {
      setLanguage(user.language as Language);
    }
  }, [user?.language]);

  // Fixed: Update time every minute with proper cleanup
  useEffect(() => {
    if (!isClient) return;
    
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, [isClient]);

  // Fixed: Get user location (client-side only)
  useEffect(() => {
    if (!isClient) return;
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            address: "நாகர்கோவில், தமிழ்நாடு"
          });
        },
        () => {
          setLocation({
            lat: 8.1778,
            lng: 77.4362,
            address: "நாகர்கோவில், தமிழ்நாடு"
          });
        }
      );
    }
  }, [isClient]);

  // Helper functions for consistent formatting
  const formatDate = useCallback((date: Date): string => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'];
    
    const dayName = days[date.getDay()];
    const day = date.getDate();
    const monthName = months[date.getMonth()];
    
    return `${dayName} ${day} ${monthName}`;
  }, []);

  const formatTime = useCallback((date: Date): string => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    
    return `${displayHours}:${displayMinutes} ${ampm}`;
  }, []);

  // Service definitions - memoized to prevent re-creation
  const serviceCards = useMemo((): ServiceCard[] => [
    {
      id: 'electrical',
      type: 'electrical',
      name_ta: 'மின்சார சேவைகள்',
      name_en: 'Electrical Services',
      icon: <Zap className="w-8 h-8 sm:w-10 lg:w-12" />,
      color: 'from-yellow-400 to-orange-500',
      services: {
        ta: ['விசிறி பழுது', 'மின்சார கம்பி', 'ஸ்விட்ச் வேலை', 'விளக்கு பழுது'],
        en: ['Fan Repair', 'Wiring Work', 'Switch Work', 'Light Repair']
      },
      description_ta: 'மின் சம்பந்தமான அனைத்து பணிகளும்',
      description_en: 'All electrical related services'
    },
    {
      id: 'plumbing', 
      type: 'plumbing',
      name_ta: 'குழாய் சேவைகள்',
      name_en: 'Plumbing Services',
      icon: <Droplets className="w-8 h-8 sm:w-10 lg:w-12" />,
      color: 'from-blue-400 to-cyan-500',
      services: {
        ta: ['குழாய் பழுது', 'கழிவறை வேலை', 'லீக்கேஜ் சரி', 'தண்ணீர் டேங்கி'],
        en: ['Pipe Repair', 'Toilet Work', 'Leakage Fix', 'Water Tank']
      },
      description_ta: 'தண்ணீர் மற்றும் குழாய் சம்பந்தமான பணிகளும்',
      description_en: 'All water and plumbing services'
    }
  ], []);

  // Event handlers with proper typing
  const handleLanguageToggle = useCallback((): void => {
    setLanguage(prevLanguage => prevLanguage === 'ta' ? 'en' : 'ta');
  }, []);

  const handleEmergencyCall = useCallback((): void => {
    const confirmed = window.confirm(
      language === 'ta' 
        ? 'அவசர சேவைக்கு அழைக்கவா?\n1800-NANJIL (9876500000)'
        : 'Call emergency service?\n1800-NANJIL (9876500000)'
    );
    if (confirmed) {
      window.location.href = 'tel:+919876500000';
    }
  }, [language]);

  const handleWhatsApp = useCallback((): void => {
    const message = language === 'ta' 
      ? 'நமஸ்கார், எனக்கு அவசர சேவை தேவை. தயவுசெய்து தொடர்பு கொள்ளவும்.'
      : 'Hello, I need emergency service. Please contact me.';
    const whatsappUrl = `https://wa.me/919876500000?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  }, [language]);

  const handleVoiceInput = useCallback((): void => {
    if (!isClient) return;
    
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert(language === 'ta' ? 'குரல் அடையாளம் ஆதரிக்கப்படவில்லை' : 'Voice recognition not supported');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = language === 'ta' ? 'ta-IN' : 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    setIsListening(true);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      console.log('Voice input:', transcript);
      
      // Voice command routing with auth check
      if (transcript.includes('electrical') || transcript.includes('மின்சாரம்') || transcript.includes('விசிறி') || transcript.includes('fan') || transcript.includes('light')) {
        handleServiceSelect('electrical');
      } else if (transcript.includes('plumbing') || transcript.includes('குழாய்') || transcript.includes('தண்ணீர்') || transcript.includes('water') || transcript.includes('pipe')) {
        handleServiceSelect('plumbing');  
      } else if (transcript.includes('emergency') || transcript.includes('அவசரம்') || transcript.includes('urgent')) {
        router.push('/contact?emergency=true');
      } else if (transcript.includes('booking') || transcript.includes('பதிவு') || transcript.includes('book')) {
        handleNavigateToBookings();
      } else if (transcript.includes('product') || transcript.includes('பொருட்கள்') || transcript.includes('buy')) {
        handleNavigateToProducts();
      } else if (transcript.includes('contact') || transcript.includes('தொடர்பு') || transcript.includes('call')) {
        router.push('/contact');
      } else {
        if (!isSignedIn) {
          router.push('/sign-in');
        } else {
          router.push('/services');
        }
      }
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  }, [isClient, language, router, isSignedIn]);

  // Auth-aware navigation handlers
  const handleServiceSelect = useCallback((serviceType: ServiceType): void => {
    if (!isSignedIn) {
      router.push('/sign-in?redirect_url=' + encodeURIComponent(`/services?type=${serviceType}`));
    } else {
      router.push(`/services?type=${serviceType}`);
    }
  }, [isSignedIn, router]);

  const handleNavigateToBookings = useCallback((): void => {
    if (!isSignedIn) {
      router.push('/sign-in?redirect_url=' + encodeURIComponent('/bookings'));
    } else {
      router.push('/bookings');
    }
  }, [isSignedIn, router]);

  const handleNavigateToProducts = useCallback((): void => {
    if (!isSignedIn) {
      router.push('/sign-in?redirect_url=' + encodeURIComponent('/products'));
    } else {
      router.push('/products');
    }
  }, [isSignedIn, router]);

  const handleNavigateToContact = useCallback((): void => {
    router.push('/contact');
  }, [router]);

  const handleAdminAccess = useCallback((): void => {
    if (isAdmin()) {
      router.push('/admin/dashboard');
    } else {
      router.push('/admin/login');
    }
  }, [isAdmin, router]);

  // Show loading state while auth is initializing
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center px-4">
          <div className="animate-spin rounded-full h-20 w-20 sm:h-32 sm:w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 font-sans">
      {/* Mobile-Responsive Header */}
      <header className="bg-white shadow-lg border-b-4 border-blue-500 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            {/* Logo - Mobile Optimized */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-green-600 p-2 sm:p-3 rounded-xl">
                <div className="flex space-x-1">
                  <Zap className="w-4 h-4 sm:w-6 sm:h-6 text-yellow-300" />
                  <Wrench className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl md:text-3xl font-black text-gray-800">
                  {currentT.title}
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 font-medium">
                  {currentT.subtitle}
                </p>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center space-x-2">
              {/* Voice Button - Always visible */}
              <button
                onClick={handleVoiceInput}
                disabled={isListening}
                className={`p-2 sm:p-3 rounded-xl transition-all duration-300 ${
                  isListening 
                    ? 'bg-red-500 text-white animate-pulse' 
                    : 'bg-gray-100 hover:bg-blue-100 text-gray-700'
                }`}
                title={currentT.voiceSearch}
              >
                <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Language Toggle - Always visible */}
              <button
                onClick={handleLanguageToggle}
                className="flex items-center space-x-1 sm:space-x-2 bg-blue-100 hover:bg-blue-200 px-2 sm:px-3 py-2 rounded-xl transition-colors"
              >
                <Globe className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                <span className="font-bold text-blue-800 text-xs sm:text-sm">
                  {language === 'ta' ? 'EN' : 'தமிழ்'}
                </span>
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              {/* Desktop Auth Controls */}
              <div className="hidden md:flex items-center space-x-2">
                <SignedIn>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600 hidden lg:block">
                      {currentT.welcome}, {user?.name}
                    </span>
                    <button
                      onClick={goToDashboard}
                      className="bg-green-100 hover:bg-green-200 text-green-800 px-3 py-2 rounded-xl font-medium transition-colors flex items-center space-x-1"
                    >
                      <User className="w-4 h-4" />
                      <span className="hidden lg:block">{currentT.dashboard}</span>
                    </button>
                    {isAdmin() && (
                      <button
                        onClick={handleAdminAccess}
                        className="bg-purple-100 hover:bg-purple-200 text-purple-800 px-3 py-2 rounded-xl font-medium transition-colors"
                      >
                        <Shield className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={logout}
                      className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-2 rounded-xl transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </SignedIn>
                <SignedOut>
                  <div className="flex items-center space-x-2">
                    <SignInButton mode="modal">
                      <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-xl font-medium transition-colors">
                        {currentT.login}
                      </button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold transition-colors">
                        {currentT.signup}
                      </button>
                    </SignUpButton>
                  </div>
                </SignedOut>
              </div>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          {isMobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-gray-200">
              <div className="pt-4 space-y-3">
                <SignedIn>
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600 font-medium">
                      {currentT.welcome}, {user?.name}
                    </div>
                    <div className="flex flex-col space-y-2">
                      <button
                        onClick={() => {
                          goToDashboard();
                          setIsMobileMenuOpen(false);
                        }}
                        className="bg-green-100 hover:bg-green-200 text-green-800 px-4 py-3 rounded-xl font-medium transition-colors flex items-center space-x-2 w-full text-left"
                      >
                        <User className="w-4 h-4" />
                        <span>{currentT.dashboard}</span>
                      </button>
                      {isAdmin() && (
                        <button
                          onClick={() => {
                            handleAdminAccess();
                            setIsMobileMenuOpen(false);
                          }}
                          className="bg-purple-100 hover:bg-purple-200 text-purple-800 px-4 py-3 rounded-xl font-medium transition-colors flex items-center space-x-2 w-full text-left"
                        >
                          <Shield className="w-4 h-4" />
                          <span>Admin</span>
                        </button>
                      )}
                      <button
                        onClick={() => {
                          logout();
                          setIsMobileMenuOpen(false);
                        }}
                        className="bg-red-100 hover:bg-red-200 text-red-800 px-4 py-3 rounded-xl transition-colors flex items-center space-x-2 w-full text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{currentT.logout}</span>
                      </button>
                    </div>
                  </div>
                </SignedIn>
                <SignedOut>
                  <div className="flex flex-col space-y-2">
                    <SignInButton mode="modal">
                      <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-3 rounded-xl font-medium transition-colors w-full text-left">
                        {currentT.login}
                      </button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-bold transition-colors w-full text-left">
                        {currentT.signup}
                      </button>
                    </SignUpButton>
                  </div>
                </SignedOut>
              </div>
            </div>
          )}

          {/* Status bar - Mobile Responsive */}
          <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
            <div className="flex items-center space-x-2 sm:space-x-4 text-xs sm:text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                {isClient ? (
                  <span>
                    {formatDate(currentTime)} • {formatTime(currentTime)}
                  </span>
                ) : (
                  <span>Loading...</span>
                )}
              </div>
              {location && (
                <div className="flex items-center space-x-1">
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="truncate max-w-32 sm:max-w-none">{location.address}</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-1 text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-medium text-xs sm:text-sm">{currentT.available24x7}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main content - Mobile Responsive */}
      <main className="container mx-auto px-4 py-6 sm:py-8">
        {/* Hero section - Mobile Optimized */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-gray-800 mb-3 sm:mb-4 leading-tight">
            {getGreeting(currentTime, language)}!
          </h2>
          <p className="text-lg sm:text-xl text-gray-700 mb-6 sm:mb-8">
            {currentT.whichService}
          </p>

          {/* Emergency call section - Mobile Responsive */}
          <div className="flex flex-col gap-4 sm:gap-6 justify-center items-center max-w-4xl mx-auto mb-8 sm:mb-12">
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 sm:p-6 lg:p-8 rounded-2xl shadow-2xl animate-pulse border-4 border-red-300 w-full max-w-sm sm:max-w-md">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <AlertTriangle className="w-8 h-8 sm:w-10 sm:h-10" />
                <div className="text-left">
                  <div className="text-lg sm:text-xl lg:text-2xl font-black">{currentT.emergency}</div>
                  <div className="text-sm sm:text-base lg:text-lg">{currentT.immediateService}</div>
                </div>
              </div>
              <div className="flex gap-2 sm:gap-3">
                <button
                  onClick={handleEmergencyCall}
                  className="flex-1 bg-white text-red-600 hover:bg-red-50 px-3 sm:px-4 py-2 sm:py-3 rounded-xl font-bold transition-colors text-sm sm:text-base"
                >
                  <Phone className="w-4 h-4 sm:w-5 sm:h-5 inline mr-1 sm:mr-2" />
                  {currentT.callNow}
                </button>
                <button
                  onClick={handleWhatsApp}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-xl font-bold transition-colors text-sm sm:text-base"
                >
                  <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 inline mr-1 sm:mr-2" />
                  WhatsApp
                </button>
              </div>
              <p className="text-xs sm:text-sm mt-2 opacity-90">1800-NANJIL</p>
            </div>

            <div className="text-lg sm:text-xl lg:text-2xl font-black text-gray-400">அல்லது / OR</div>

            <button
              onClick={handleVoiceInput}
              disabled={isListening}
              className={`${
                isListening 
                  ? 'bg-red-100 border-red-300 text-red-600' 
                  : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white'
              } font-black text-lg sm:text-xl py-4 sm:py-6 px-6 sm:px-8 rounded-2xl shadow-xl transition-all duration-300 w-full max-w-sm sm:max-w-md border-4`}
            >
              <div className="flex items-center justify-center space-x-2 sm:space-x-3">
                <Mic className={`w-6 h-6 sm:w-8 sm:h-8 ${isListening ? 'animate-pulse' : ''}`} />
                <div>
                  {isListening ? currentT.listening : currentT.speak}
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Service cards - Mobile Responsive */}
        <section className="mb-12 sm:mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-6xl mx-auto">
            {serviceCards.map((service) => (
              <div
                key={service.id}
                onClick={() => handleServiceSelect(service.type)}
                className="group cursor-pointer bg-white rounded-2xl sm:rounded-3xl shadow-xl hover:shadow-2xl transform hover:-translate-y-2 sm:hover:-translate-y-3 transition-all duration-300 overflow-hidden border-4 border-gray-100 hover:border-blue-300"
              >
                <div className={`h-3 sm:h-4 bg-gradient-to-r ${service.color}`}></div>
                <div className="p-4 sm:p-6 lg:p-8">
                  <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
                    <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-r ${service.color} bg-opacity-20`}>
                      <div className={`${service.id === 'electrical' ? 'text-yellow-600' : 'text-blue-600'}`}>
                        {service.icon}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-800">
                        {language === 'ta' ? service.name_ta : service.name_en}
                      </h4>
                      <p className="text-sm sm:text-base text-gray-600 font-medium">
                        {language === 'ta' ? service.description_ta : service.description_en}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
                    {service.services[language].map((item, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 px-2 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl text-center font-medium text-gray-700 hover:bg-blue-50 transition-colors text-xs sm:text-sm"
                      >
                        {item}
                      </div>
                    ))}
                  </div>

                  <div className={`text-center py-3 sm:py-4 px-4 sm:px-6 rounded-xl bg-gradient-to-r ${service.color} text-white font-bold text-base sm:text-lg group-hover:shadow-lg transition-shadow flex items-center justify-center space-x-2`}>
                    <span>{isSignedIn ? currentT.bookNow : currentT.getStarted}</span>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Why choose us - Mobile Responsive */}
        <section className="mb-12 sm:mb-16">
          <h3 className="text-2xl sm:text-3xl font-black text-center text-gray-800 mb-8 sm:mb-12">
            {currentT.whyChooseUs}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-6xl mx-auto">
            {[
              {
                icon: <Users className="w-8 h-8 sm:w-10 lg:w-12 text-blue-600" />,
                title: currentT.experienced,
                desc: currentT.years8Plus
              },
              {
                icon: <Clock className="w-8 h-8 sm:w-10 lg:w-12 text-green-600" />,
                title: currentT.quickResponse,
                desc: currentT.mins30
              },
              {
                icon: <Star className="w-8 h-8 sm:w-10 lg:w-12 text-yellow-600" />,
                title: currentT.qualityWork,
                desc: currentT.rating46
              },
              {
                icon: <Phone className="w-8 h-8 sm:w-10 lg:w-12 text-purple-600" />,
                title: currentT.available247,
                desc: currentT.emergencyService
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-shadow text-center group hover:-translate-y-1 duration-300"
              >
                <div className="flex justify-center mb-2 sm:mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h4 className="text-sm sm:text-base lg:text-lg font-bold text-gray-800 mb-1 sm:mb-2">
                  {feature.title}
                </h4>
                <p className="text-xs sm:text-sm text-gray-600">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Quick actions - Mobile Responsive */}
        <section className="mb-12 sm:mb-16">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
            <button
              onClick={handleNavigateToBookings}
              className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 text-center border-2 border-gray-100 hover:border-blue-300"
            >
              <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">📋</div>
              <div className="text-base sm:text-lg font-bold text-gray-800">{currentT.myBookings}</div>
              {!isSignedIn && <div className="text-xs sm:text-sm text-red-500 mt-1">{currentT.loginRequired}</div>}
            </button>
            <button
              onClick={handleNavigateToProducts}
              className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 text-center border-2 border-gray-100 hover:border-blue-300"
            >
              <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">🛒</div>
              <div className="text-base sm:text-lg font-bold text-gray-800">{currentT.products}</div>
              {!isSignedIn && <div className="text-xs sm:text-sm text-red-500 mt-1">{currentT.loginRequired}</div>}
            </button>
            <button
              onClick={handleNavigateToContact}
              className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 text-center border-2 border-gray-100 hover:border-blue-300"
            >
              <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">📞</div>
              <div className="text-base sm:text-lg font-bold text-gray-800">{currentT.contact}</div>
            </button>
          </div>
        </section>

        {/* Stats - Mobile Responsive */}
        <section className="mb-12 sm:mb-16">
          <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white text-center">
            <div className="grid grid-cols-3 gap-4 sm:gap-8">
              <div className="group">
                <div className="text-3xl sm:text-4xl lg:text-5xl font-black mb-1 sm:mb-2 group-hover:scale-110 transition-transform">500+</div>
                <div className="text-sm sm:text-lg lg:text-xl font-medium">{currentT.happyCustomers}</div>
              </div>
              <div className="group">
                <div className="text-3xl sm:text-4xl lg:text-5xl font-black mb-1 sm:mb-2 group-hover:scale-110 transition-transform">24/7</div>
                <div className="text-sm sm:text-lg lg:text-xl font-medium">{currentT.available24x7}</div>
              </div>
              <div className="group">
                <div className="text-3xl sm:text-4xl lg:text-5xl font-black mb-1 sm:mb-2 group-hover:scale-110 transition-transform">4.6★</div>
                <div className="text-sm sm:text-lg lg:text-xl font-medium">{currentT.reviews}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Service hours - Mobile Responsive */}
        <section className="mb-6 sm:mb-8">
          <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center border-2 border-gray-200">
            <h4 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-800 flex items-center justify-center space-x-2">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
              <span>{currentT.serviceHours}</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm">
                <div className="font-bold text-gray-800 mb-1 sm:mb-2 text-sm sm:text-base">{currentT.regularService}</div>
                <div className="text-gray-600 text-sm sm:text-base">{currentT.morningToEvening}</div>
              </div>
              <div className="bg-red-50 p-3 sm:p-4 rounded-xl shadow-sm border border-red-200">
                <div className="font-bold text-red-800 mb-1 sm:mb-2 text-sm sm:text-base">{currentT.emergency247}</div>
                <div className="flex items-center justify-center space-x-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-red-600 text-sm">Always Available</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer - Mobile Responsive */}
      <footer className="bg-gray-900 text-white py-6 sm:py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-4 sm:mb-6">
            <h4 className="text-xl sm:text-2xl font-bold mb-2">{currentT.title}</h4>
            <p className="text-gray-300 text-sm sm:text-base">{currentT.trustedPartner}</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
            <div>
              <h5 className="font-bold mb-2 text-red-400 text-sm sm:text-base">{currentT.emergency}</h5>
              <p className="text-2xl sm:text-3xl font-black text-red-400">1800-NANJIL</p>
              <p className="text-gray-400 text-sm">9876-500-000</p>
            </div>
            <div>
              <h5 className="font-bold mb-2 text-sm sm:text-base">{currentT.serviceHours}</h5>
              <p className="text-gray-300 text-sm sm:text-base">{currentT.morningToEvening}</p>
              <p className="text-red-400 text-sm sm:text-base">{currentT.emergency247}</p>
            </div>
            <div>
              <h5 className="font-bold mb-2 text-sm sm:text-base">Service Areas</h5>
              <p className="text-gray-300 text-xs sm:text-sm">
                {language === 'ta' ? 'நாகர்கோவில் • கன்னியாகுமரி • மார்த்தாண்டம்' : 'Nagercoil • Kanyakumari • Marthandam'}
              </p>
            </div>
          </div>

          <div className="border-t border-gray-600 pt-4">
            <p className="text-gray-400 text-xs sm:text-sm">
              © 2024 {currentT.title}. {language === 'ta' ? 'அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை' : 'All rights reserved'}.
            </p>
            <p className="text-xs text-gray-500 mt-2">{currentT.servingAreas}</p>
          </div>
        </div>
      </footer>

      {/* Voice input overlay - Mobile Responsive */}
      {isListening && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 sm:p-8 rounded-2xl text-center shadow-2xl max-w-sm mx-auto w-full">
            <div className="animate-pulse mb-4 sm:mb-6">
              <Mic className="w-16 h-16 sm:w-20 sm:h-20 text-red-500 mx-auto" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold mb-2 text-gray-800">
              {language === 'ta' ? 'பேசுங்கள்...' : 'Listening...'}
            </h3>
            <p className="text-gray-600 mb-4 text-sm sm:text-base">
              {language === 'ta' 
                ? 'உங்கள் சேவை தேவையை சொல்லுங்கள்'
                : 'Tell us what service you need'
              }
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
              <span>Recording...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;