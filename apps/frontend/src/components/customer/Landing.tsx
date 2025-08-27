import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  Fan,
  Lightbulb,
  Droplets,
  Settings,
  CheckCircle,
  ArrowRight,
  MessageCircle
} from 'lucide-react';

// Types
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
  const [language, setLanguage] = useState<Language>('ta');
  const [location, setLocation] = useState<Location | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Initialize client-side only
  useEffect(() => {
    setIsClient(true);
    setCurrentTime(new Date());
  }, []);

  // Update time every minute (client-side only)
  useEffect(() => {
    if (!isClient) return;
    
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, [isClient]);

  // Get user location (client-side only)
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
          // Default to Nagercoil
          setLocation({
            lat: 8.1778,
            lng: 77.4362,
            address: "நாகர்கோவில், தமிழ்நாடு"
          });
        }
      );
    }
  }, [isClient]);

  // Translations
  const t = {
    ta: {
      title: "நாஞ்சில் MEP சேவை",
      subtitle: "மின்சாரம் • குழாய் • அவசர சேவை",
      tagline: "உங்கள் வீட்டின் நம்பகமான சேவை கூட்டாளர்",
      greeting: () => {
        if (!currentTime) return language === 'ta' ? 'வணக்கம்' : 'Hello';
        const hour = currentTime.getHours();
        return hour < 12 ? (language === 'ta' ? 'காலை வணக்கம்' : 'Good Morning') : 
               hour < 18 ? (language === 'ta' ? 'மதிய வணக்கம்' : 'Good Afternoon') : 
                          (language === 'ta' ? 'மாலை வணக்கம்' : 'Good Evening');
      },
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
      bookElectrical: "மின்சார சேவை பதிவு",
      bookPlumbing: "குழாய் சேவை பதிவு",
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
      servingAreas: "நாகர்கோவில் மற்றும் சுற்றுப்புற பகுতிகளில் சேவை"
    },
    en: {
      title: "Nanjil MEP Service",
      subtitle: "Electrical • Plumbing • Emergency Service",
      tagline: "Your Home's Trusted Service Partner",
      greeting: () => {
        if (!currentTime) return 'Hello';
        const hour = currentTime.getHours();
        return hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';
      },
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
      bookElectrical: "Book Electrical Service",
      bookPlumbing: "Book Plumbing Service",
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
      servingAreas: "Serving Nagercoil and surrounding areas"
    }
  };

  // Helper functions for consistent formatting
  const formatDate = (date: Date): string => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'];
    
    const dayName = days[date.getDay()];
    const day = date.getDate();
    const monthName = months[date.getMonth()];
    
    return `${dayName} ${day} ${monthName}`;
  };

  const formatTime = (date: Date): string => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    
    return `${displayHours}:${displayMinutes} ${ampm}`;
  };

  const currentT = t[language];

  // Service definitions
  const serviceCards: ServiceCard[] = [
    {
      id: 'electrical',
      type: 'electrical',
      name_ta: 'மின்சார சேவைகள்',
      name_en: 'Electrical Services',
      icon: <Zap className="w-12 h-12" />,
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
      icon: <Droplets className="w-12 h-12" />,
      color: 'from-blue-400 to-cyan-500',
      services: {
        ta: ['குழாய் பழுது', 'கழிவறை வேலை', 'லீக்கேஜ் சரி', 'தண்ணீர் டேங்கி'],
        en: ['Pipe Repair', 'Toilet Work', 'Leakage Fix', 'Water Tank']
      },
      description_ta: 'தண்ணீர் மற்றும் குழாய் சம்பந்தமான பணிகளும்',
      description_en: 'All water and plumbing services'
    }
  ];

  // Event handlers
  const handleLanguageToggle = () => {
    setLanguage(language === 'ta' ? 'en' : 'ta');
  };

  const handleEmergencyCall = () => {
    const confirmed = window.confirm(
      language === 'ta' 
        ? 'அவசர சேவைக்கு அழைக்கவா?\n1800-NANJIL (9876500000)'
        : 'Call emergency service?\n1800-NANJIL (9876500000)'
    );
    if (confirmed) {
      window.location.href = 'tel:+919876500000';
    }
  };

  const handleWhatsApp = () => {
    const message = language === 'ta' 
      ? 'நமஸ்கார், எனக்கு அவசர சேவை தேவை. தயவுசெய்து தொடர்பு கொள்ளவும்.'
      : 'Hello, I need emergency service. Please contact me.';
    const whatsappUrl = `https://wa.me/919876500000?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleVoiceInput = () => {
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
      
      // Voice command routing
      if (transcript.includes('electrical') || transcript.includes('மின்சாரம்') || transcript.includes('விசிறி') || transcript.includes('fan') || transcript.includes('light')) {
        router.push('/services?type=electrical');
      } else if (transcript.includes('plumbing') || transcript.includes('குழாய்') || transcript.includes('தண்ணீர்') || transcript.includes('water') || transcript.includes('pipe')) {
        router.push('/services?type=plumbing');  
      } else if (transcript.includes('emergency') || transcript.includes('அவசரம்') || transcript.includes('urgent')) {
        router.push('/contact?emergency=true');
      } else if (transcript.includes('booking') || transcript.includes('பதிவு') || transcript.includes('book')) {
        router.push('/bookings');
      } else if (transcript.includes('product') || transcript.includes('பொருட்கள்') || transcript.includes('buy')) {
        router.push('/products');
      } else if (transcript.includes('contact') || transcript.includes('தொடர்பு') || transcript.includes('call')) {
        router.push('/contact');
      } else {
        // If no specific command, go to services page
        router.push('/services');
      }
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const handleServiceSelect = (serviceType: ServiceType) => {
    // Navigate to services page with service type parameter
    router.push(`/services?type=${serviceType}`);
  };

  const handleEmergencyService = () => {
    // For emergency, go directly to contact with emergency flag
    router.push('/contact?emergency=true');
  };

  const handleNavigateToBookings = () => {
    router.push('/bookings');
  };

  const handleNavigateToProducts = () => {
    router.push('/products');
  };

  const handleNavigateToContact = () => {
    router.push('/contact');
  };

  const handleStartBookingFlow = () => {
    // Start the booking flow from services selection
    router.push('/services');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 font-sans">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-blue-500">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-green-600 p-3 rounded-xl">
                <div className="flex space-x-1">
                  <Zap className="w-6 h-6 text-yellow-300" />
                  <Wrench className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-gray-800">
                  {currentT.title}
                </h1>
                <p className="text-sm text-gray-600 font-medium">
                  {currentT.subtitle}
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleVoiceInput}
                disabled={isListening}
                className={`p-3 rounded-xl transition-all duration-300 ${
                  isListening 
                    ? 'bg-red-500 text-white animate-pulse' 
                    : 'bg-gray-100 hover:bg-blue-100 text-gray-700'
                }`}
                title={currentT.voiceSearch}
              >
                <Mic className="w-5 h-5" />
              </button>
              <button
                onClick={handleLanguageToggle}
                className="flex items-center space-x-2 bg-blue-100 hover:bg-blue-200 px-4 py-2 rounded-xl transition-colors"
              >
                <Globe className="w-5 h-5 text-blue-600" />
                <span className="font-bold text-blue-800">
                  {language === 'ta' ? 'EN' : 'தமிழ்'}
                </span>
              </button>
            </div>
          </div>

          {/* Status bar */}
          <div className="mt-4 flex flex-col md:flex-row justify-between items-start md:items-center space-y-2 md:space-y-0">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                {isClient && currentTime ? (
                  <span>
                    {formatDate(currentTime)} • {formatTime(currentTime)}
                  </span>
                ) : (
                  <span>Loading...</span>
                )}
              </div>
              {location && (
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{location.address}</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-1 text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-medium text-sm">{currentT.available24x7}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        {/* Hero section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-black text-gray-800 mb-4 leading-tight">
            {currentT.greeting()}!
          </h2>
          <p className="text-xl text-gray-700 mb-8">
            {currentT.whichService}
          </p>

          {/* Emergency call section */}
          <div className="flex flex-col md:flex-row gap-6 justify-center items-center max-w-4xl mx-auto mb-12">
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-8 rounded-2xl shadow-2xl animate-pulse border-4 border-red-300 min-w-[280px]">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <AlertTriangle className="w-10 h-10" />
                <div className="text-left">
                  <div className="text-2xl font-black">{currentT.emergency}</div>
                  <div className="text-lg">{currentT.immediateService}</div>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleEmergencyCall}
                  className="flex-1 bg-white text-red-600 hover:bg-red-50 px-4 py-3 rounded-xl font-bold transition-colors"
                >
                  <Phone className="w-5 h-5 inline mr-2" />
                  {currentT.callNow}
                </button>
                <button
                  onClick={handleWhatsApp}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-xl font-bold transition-colors"
                >
                  <MessageCircle className="w-5 h-5 inline mr-2" />
                  WhatsApp
                </button>
              </div>
              <p className="text-sm mt-2 opacity-90">1800-NANJIL</p>
            </div>

            <div className="text-2xl font-black text-gray-400">அல்லது / OR</div>

            <button
              onClick={handleVoiceInput}
              disabled={isListening}
              className={`${
                isListening 
                  ? 'bg-red-100 border-red-300 text-red-600' 
                  : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white'
              } font-black text-xl py-6 px-8 rounded-2xl shadow-xl transition-all duration-300 min-w-[280px] border-4`}
            >
              <div className="flex items-center justify-center space-x-3">
                <Mic className={`w-8 h-8 ${isListening ? 'animate-pulse' : ''}`} />
                <div>
                  {isListening ? currentT.listening : currentT.speak}
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Service cards */}
        <section className="mb-16">
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {serviceCards.map((service) => (
              <div
                key={service.id}
                onClick={() => handleServiceSelect(service.type)}
                className="group cursor-pointer bg-white rounded-3xl shadow-xl hover:shadow-2xl transform hover:-translate-y-3 transition-all duration-300 overflow-hidden border-4 border-gray-100 hover:border-blue-300"
              >
                <div className={`h-4 bg-gradient-to-r ${service.color}`}></div>
                <div className="p-8">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className={`p-4 rounded-2xl bg-gradient-to-r ${service.color} bg-opacity-20 text-${service.id === 'electrical' ? 'yellow' : 'blue'}-600`}>
                      {service.icon}
                    </div>
                    <div>
                      <h4 className="text-3xl font-black text-gray-800">
                        {language === 'ta' ? service.name_ta : service.name_en}
                      </h4>
                      <p className="text-gray-600 font-medium">
                        {language === 'ta' ? service.description_ta : service.description_en}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {service.services[language].map((item, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 px-4 py-3 rounded-xl text-center font-medium text-gray-700 hover:bg-blue-50 transition-colors"
                      >
                        {item}
                      </div>
                    ))}
                  </div>

                  <div className={`text-center py-4 px-6 rounded-xl bg-gradient-to-r ${service.color} text-white font-bold text-lg group-hover:shadow-lg transition-shadow flex items-center justify-center space-x-2`}>
                    <span>{language === 'ta' ? 'பதிவு செய்க' : 'Book Now'}</span>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Why choose us */}
        <section className="mb-16">
          <h3 className="text-3xl font-black text-center text-gray-800 mb-12">
            {currentT.whyChooseUs}
          </h3>
          <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              {
                icon: <Users className="w-12 h-12 text-blue-600" />,
                title: currentT.experienced,
                desc: currentT.years8Plus
              },
              {
                icon: <Clock className="w-12 h-12 text-green-600" />,
                title: currentT.quickResponse,
                desc: currentT.mins30
              },
              {
                icon: <Star className="w-12 h-12 text-yellow-600" />,
                title: currentT.qualityWork,
                desc: currentT.rating46
              },
              {
                icon: <Phone className="w-12 h-12 text-purple-600" />,
                title: currentT.available247,
                desc: currentT.emergencyService
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow text-center group hover:-translate-y-1 duration-300"
              >
                <div className="flex justify-center mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h4 className="text-lg font-bold text-gray-800 mb-2">
                  {feature.title}
                </h4>
                <p className="text-gray-600">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Quick actions */}
        <section className="mb-16">
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <button
              onClick={handleNavigateToBookings}
              className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 text-center border-2 border-gray-100 hover:border-blue-300"
            >
              <div className="text-4xl mb-3">📋</div>
              <div className="text-lg font-bold text-gray-800">{currentT.myBookings}</div>
            </button>
            <button
              onClick={handleNavigateToProducts}
              className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 text-center border-2 border-gray-100 hover:border-blue-300"
            >
              <div className="text-4xl mb-3">🛒</div>
              <div className="text-lg font-bold text-gray-800">{currentT.products}</div>
            </button>
            <button
              onClick={handleNavigateToContact}
              className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 text-center border-2 border-gray-100 hover:border-blue-300"
            >
              <div className="text-4xl mb-3">📞</div>
              <div className="text-lg font-bold text-gray-800">{currentT.contact}</div>
            </button>
          </div>
        </section>

        {/* Stats */}
        <section className="mb-16">
          <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-3xl p-8 text-white text-center">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="group">
                <div className="text-5xl font-black mb-2 group-hover:scale-110 transition-transform">500+</div>
                <div className="text-xl font-medium">{currentT.happyCustomers}</div>
              </div>
              <div className="group">
                <div className="text-5xl font-black mb-2 group-hover:scale-110 transition-transform">24/7</div>
                <div className="text-xl font-medium">{currentT.available24x7}</div>
              </div>
              <div className="group">
                <div className="text-5xl font-black mb-2 group-hover:scale-110 transition-transform">4.6★</div>
                <div className="text-xl font-medium">{currentT.reviews}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Service hours */}
        <section className="mb-8">
          <div className="bg-gray-50 rounded-2xl p-6 text-center border-2 border-gray-200">
            <h4 className="text-2xl font-bold mb-6 text-gray-800 flex items-center justify-center space-x-2">
              <Clock className="w-6 h-6" />
              <span>{currentT.serviceHours}</span>
            </h4>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-4 rounded-xl shadow-sm">
                <div className="font-bold text-gray-800 mb-2">{currentT.regularService}</div>
                <div className="text-gray-600">{currentT.morningToEvening}</div>
              </div>
              <div className="bg-red-50 p-4 rounded-xl shadow-sm border border-red-200">
                <div className="font-bold text-red-800 mb-2">{currentT.emergency247}</div>
                <div className="flex items-center justify-center space-x-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-red-600">Always Available</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-6">
            <h4 className="text-2xl font-bold mb-2">{currentT.title}</h4>
            <p className="text-gray-300">{currentT.trustedPartner}</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div>
              <h5 className="font-bold mb-2 text-red-400">{currentT.emergency}</h5>
              <p className="text-3xl font-black text-red-400">1800-NANJIL</p>
              <p className="text-gray-400">9876-500-000</p>
            </div>
            <div>
              <h5 className="font-bold mb-2">{currentT.serviceHours}</h5>
              <p className="text-gray-300">{currentT.morningToEvening}</p>
              <p className="text-red-400">{currentT.emergency247}</p>
            </div>
            <div>
              <h5 className="font-bold mb-2">Service Areas</h5>
              <p className="text-gray-300">
                {language === 'ta' ? 'நாகர்கோவில் • கன்னியாகுமரி • மார்த்தாண்டம்' : 'Nagercoil • Kanyakumari • Marthandam'}
              </p>
            </div>
          </div>

          <div className="border-t border-gray-600 pt-4">
            <p className="text-gray-400">
              © 2024 {currentT.title}. {language === 'ta' ? 'அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை' : 'All rights reserved'}.
            </p>
            <p className="text-sm text-gray-500 mt-2">{currentT.servingAreas}</p>
          </div>
        </div>
      </footer>

      {/* Voice input overlay */}
      {isListening && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl text-center shadow-2xl max-w-sm mx-4">
            <div className="animate-pulse mb-6">
              <Mic className="w-20 h-20 text-red-500 mx-auto" />
            </div>
            <h3 className="text-2xl font-bold mb-2 text-gray-800">
              {language === 'ta' ? 'பேசுங்கள்...' : 'Listening...'}
            </h3>
            <p className="text-gray-600 mb-4">
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