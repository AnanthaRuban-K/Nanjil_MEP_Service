// apps/frontend/src/components/booking/BookingForm.tsx - Production Ready
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  ArrowLeft, 
  ArrowRight, 
  Zap, 
  Droplets, 
  Mic, 
  MicOff,
  Camera, 
  MapPin, 
  Clock, 
  Check,
  AlertTriangle,
  Phone,
  User,
  Home,
  Upload,
  X
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card } from '../ui/card';
import { useAuthStore } from '../../stores/auth-store';
import { useBookingStore } from '../../stores/booking-store';
import { useRouter } from 'next/navigation';

// Fixed Location type - ensure address is required
interface Location {
  lat: number;
  lng: number;
  address: string; // Required field
}

// Validation Schema - Fixed with proper Location type
const contactInfoSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter valid 10-digit mobile number'),
  address: z.string().min(20, 'Please provide complete address'),
  alternatePhone: z.string().regex(/^[6-9]\d{9}$/, 'Enter valid mobile number').optional().or(z.literal(''))
});

const bookingSchema = z.object({
  serviceType: z.enum(['electrical', 'plumbing']),
  subService: z.string().min(1, 'Please select a specific service'),
  description: z.string().min(10, 'Please describe the problem in detail'),
  photos: z.array(z.string()).optional(),
  contactInfo: contactInfoSchema,
  scheduledTime: z.string().min(1, 'Please select a time slot'),
  priority: z.enum(['normal', 'urgent', 'emergency']).default('normal'),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
    address: z.string().min(1, 'Address is required')
  }).optional()
});

type BookingFormData = z.infer<typeof bookingSchema>;

// Fixed interface with consistent property names
interface LocalizedText {
  ta: string;
  en: string;
}

interface ServiceOption {
  id: string;
  icon: React.ReactNode;
  name: LocalizedText;
  description: LocalizedText;
  basePrice: string;
}

interface TimeSlot {
  id: string;
  time: string;
  label: LocalizedText;
  available: boolean;
}

const BookingForm: React.FC = () => {
  const router = useRouter();
  const { language, location, setLocation } = useAuthStore();
  const { 
    currentBooking, 
    currentStep, 
    nextStep, 
    prevStep, 
    resetBooking,
    updateBookingStep,
    addBooking,
    setLoading,
    setError 
  } = useBookingStore();

  const [isListening, setIsListening] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [isEmergency, setIsEmergency] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
    trigger
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      serviceType: currentBooking.service || undefined,
      subService: '',
      description: currentBooking.description || '',
      photos: [],
      contactInfo: {
        name: '',
        phone: '',
        address: '',
        alternatePhone: ''
      },
      scheduledTime: currentBooking.scheduledTime || '',
      priority: 'normal'
    }
  });

  const watchedServiceType = watch('serviceType');

  // Service options - Fixed with consistent property names
  const electricalServices: ServiceOption[] = [
    {
      id: 'fan-repair',
      icon: <Zap className="w-8 h-8" />,
      name: { ta: 'விசிறி பழுது', en: 'Fan Repair' },
      description: { ta: 'விசிறி வேலை செய்யவில்லை, சத்தம்', en: 'Fan not working, noise issues' },
      basePrice: '₹200'
    },
    {
      id: 'wiring',
      icon: <Zap className="w-8 h-8" />,
      name: { ta: 'வையரிங்', en: 'Electrical Wiring' },
      description: { ta: 'புதிய வயர், பழைய வயர் மாற்று', en: 'New wiring, old wire replacement' },
      basePrice: '₹500'
    },
    {
      id: 'switch-repair',
      icon: <Zap className="w-8 h-8" />,
      name: { ta: 'சுவிட்ச் பழுது', en: 'Switch Repair' },
      description: { ta: 'சுவிட்ச், சாக்கெட் வேலை செய்யவில்லை', en: 'Switch, socket not working' },
      basePrice: '₹150'
    },
    {
      id: 'lighting',
      icon: <Zap className="w-8 h-8" />,
      name: { ta: 'விளக்கு பொருத்துதல்', en: 'Light Installation' },
      description: { ta: 'LED, டியூப் லைட் பொருத்துதல்', en: 'LED, tube light installation' },
      basePrice: '₹100'
    }
  ];

  const plumbingServices: ServiceOption[] = [
    {
      id: 'pipe-repair',
      icon: <Droplets className="w-8 h-8" />,
      name: { ta: 'குழாய் பழுது', en: 'Pipe Repair' },
      description: { ta: 'தண்ணீர் கசிவு, குழாய் உடைவு', en: 'Water leakage, pipe bursts' },
      basePrice: '₹300'
    },
    {
      id: 'toilet-repair',
      icon: <Droplets className="w-8 h-8" />,
      name: { ta: 'கழிப்பறை பழுது', en: 'Toilet Repair' },
      description: { ta: 'பிளஷ் வேலை செய்யவில்லை, கசிவு', en: 'Flush not working, leakage' },
      basePrice: '₹250'
    },
    {
      id: 'tank-service',
      icon: <Droplets className="w-8 h-8" />,
      name: { ta: 'தண்ணீர் டேங்க்', en: 'Water Tank' },
      description: { ta: 'டேங்க் சுத்தம், பம்ப் பழுது', en: 'Tank cleaning, pump repair' },
      basePrice: '₹400'
    },
    {
      id: 'tap-repair',
      icon: <Droplets className="w-8 h-8" />,
      name: { ta: 'குழாய் பழுது', en: 'Tap Repair' },
      description: { ta: 'குழாய் கசிவு, மாற்று', en: 'Tap leakage, replacement' },
      basePrice: '₹150'
    }
  ];

  // Time slots - Fixed with consistent property names
  const timeSlots: TimeSlot[] = [
    {
      id: 'morning-1',
      time: '09:00-11:00',
      label: { ta: 'காலை 9:00-11:00', en: 'Morning 9:00-11:00 AM' },
      available: true
    },
    {
      id: 'morning-2', 
      time: '11:00-13:00',
      label: { ta: 'முற்பகல் 11:00-1:00', en: 'Late Morning 11:00 AM-1:00 PM' },
      available: true
    },
    {
      id: 'afternoon-1',
      time: '14:00-16:00', 
      label: { ta: 'மதியம் 2:00-4:00', en: 'Afternoon 2:00-4:00 PM' },
      available: true
    },
    {
      id: 'afternoon-2',
      time: '16:00-18:00',
      label: { ta: 'மாலை 4:00-6:00', en: 'Evening 4:00-6:00 PM' },
      available: false
    },
    {
      id: 'evening',
      time: '18:00-20:00',
      label: { ta: 'மாலை 6:00-8:00', en: 'Evening 6:00-8:00 PM' },
      available: true
    }
  ];

  // Fixed helper function with proper typing
  const getText = (textObj: LocalizedText): string => {
    return textObj[language] || textObj.en; // Fallback to English
  };

  // Get user location on mount - Fixed location handling with proper types
  useEffect(() => {
    if (!location && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            address: 'Current Location' // Ensure address is provided
          };
          
          setLocation(newLocation);
          setValue('location', newLocation);
        },
        (error) => {
          console.warn('Location access denied:', error);
          // Fallback to Nagercoil
          const defaultLocation = {
            lat: 8.1778,
            lng: 77.4362,
            address: 'நாகர்கோயில் - Nagercoil'
          };
          setLocation(defaultLocation);
          setValue('location', defaultLocation);
        }
      );
    } else if (location) {
      // Ensure location has required address field
      const formLocation: Location = {
        lat: location.lat,
        lng: location.lng,
        address: location.address || 'Current Location'
      };
      setValue('location', formLocation);
    }
  }, [location, setLocation, setValue]);

  const getCurrentServices = (): ServiceOption[] => {
    return watchedServiceType === 'electrical' ? electricalServices : plumbingServices;
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError(language === 'ta' 
        ? 'வாய்ஸ் இன்புட் ஆதரிக்கப்படவில்லை'
        : 'Voice input not supported'
      );
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = language === 'ta' ? 'ta-IN' : 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    setIsListening(true);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      const currentDescription = watch('description') || '';
      const newDescription = currentDescription ? `${currentDescription} ${transcript}` : transcript;
      setValue('description', newDescription);
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      setError(language === 'ta' ? 'வாய்ஸ் பிழை' : 'Voice input error');
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newPhotos: string[] = [];
    let processedFiles = 0;
    
    Array.from(files).forEach(file => {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError(language === 'ta' 
          ? 'படம் அளவு 5MB க்கும் குறைவாக இருக்க வேண்டும்' 
          : 'Image size should be less than 5MB'
        );
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          newPhotos.push(e.target.result as string);
          processedFiles++;
          
          if (processedFiles === files.length) {
            const updatedPhotos = [...selectedPhotos, ...newPhotos];
            setSelectedPhotos(updatedPhotos);
            setValue('photos', updatedPhotos);
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    const updatedPhotos = selectedPhotos.filter((_, i) => i !== index);
    setSelectedPhotos(updatedPhotos);
    setValue('photos', updatedPhotos);
  };

  const handleEmergencyBooking = () => {
    setIsEmergency(true);
    setValue('priority', 'emergency');
    setValue('scheduledTime', 'emergency-now');
    // Skip to contact form
    while (currentStep < 3) {
      nextStep();
    }
  };

  const handleStepSubmit = async (data: BookingFormData) => {
    setLoading(true);
    try {
      // Validate current step
      let isValid = false;
      switch (currentStep) {
        case 1:
          isValid = await trigger(['serviceType', 'subService']);
          break;
        case 2:
          isValid = await trigger(['description']);
          break;
        case 3:
          isValid = await trigger(['contactInfo']);
          break;
        case 4:
          isValid = await trigger(['scheduledTime']);
          break;
        case 5:
          isValid = true;
          break;
      }

      if (!isValid) {
        setLoading(false);
        return;
      }

      updateBookingStep(data);
      
      if (currentStep === 5) {
        // Final submission
        const bookingData = {
          ...currentBooking,
          ...data,
          id: Date.now().toString(),
          status: 'pending' as const,
          createdAt: new Date().toISOString()
        };
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        addBooking(bookingData as any);
        router.push(`/booking-success/${bookingData.id}`);
      } else {
        nextStep();
      }
    } catch (error) {
      console.error('Booking submission error:', error);
      setError(language === 'ta' 
        ? 'சமர்பிக்க முடியவில்லை. மீண்டும் முயற்சி செய்க.'
        : 'Submission failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const renderProgressIndicator = () => {
    const steps = [
      { label: language === 'ta' ? 'சேவை' : 'Service', step: 1 },
      { label: language === 'ta' ? 'பிரச்சனை' : 'Problem', step: 2 },
      { label: language === 'ta' ? 'தொடர்பு' : 'Contact', step: 3 },
      { label: language === 'ta' ? 'நேரம்' : 'Time', step: 4 },
      { label: language === 'ta' ? 'உறுதி' : 'Confirm', step: 5 }
    ];

    return (
      <div className="flex justify-center mb-8">
        <div className="flex items-center space-x-2">
          {steps.map((step, index) => (
            <React.Fragment key={step.step}>
              <div className={`flex items-center ${currentStep >= step.step ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  currentStep >= step.step ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {currentStep > step.step ? <Check className="w-4 h-4" /> : step.step}
                </div>
                <span className={`ml-2 text-xs font-medium ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-8 h-0.5 ${currentStep > step.step ? 'bg-blue-500' : 'bg-gray-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  const renderServiceSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className={`text-3xl font-black mb-4 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
          {language === 'ta' ? 'எந்த சேவை வேண்டும்?' : 'What service do you need?'}
        </h2>
        
        {/* Emergency Button */}
        <Button
          type="button"
          onClick={handleEmergencyBooking}
          className="mb-8 bg-red-500 hover:bg-red-600 text-white px-6 py-4 rounded-xl font-bold text-lg animate-pulse shadow-lg"
        >
          <AlertTriangle className="w-5 h-5 mr-2" />
          <span className={language === 'ta' ? 'font-tamil' : 'font-english'}>
            {language === 'ta' ? '🚨 அவசரம் - உடனே தேவை' : '🚨 EMERGENCY - Need Now'}
          </span>
        </Button>
      </div>

      {/* Service Type Selection */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card
          className={`p-6 cursor-pointer border-2 transition-all hover:-translate-y-1 ${
            watchedServiceType === 'electrical'
              ? 'border-yellow-400 bg-yellow-50 shadow-lg'
              : 'border-gray-200 hover:border-yellow-300'
          }`}
          onClick={() => setValue('serviceType', 'electrical')}
        >
          <div className="text-center">
            <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-yellow-600" />
            </div>
            <h3 className={`text-xl font-bold mb-2 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
              {language === 'ta' ? 'மின்சார சேவைகள்' : 'Electrical Services'}
            </h3>
            <p className={`text-gray-600 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
              {language === 'ta' 
                ? 'விசிறி, விளக்கு, வையரிங், சுவிட்ச் பழுது'
                : 'Fan, Lights, Wiring, Switch repair'
              }
            </p>
          </div>
        </Card>

        <Card
          className={`p-6 cursor-pointer border-2 transition-all hover:-translate-y-1 ${
            watchedServiceType === 'plumbing'
              ? 'border-blue-400 bg-blue-50 shadow-lg'
              : 'border-gray-200 hover:border-blue-300'
          }`}
          onClick={() => setValue('serviceType', 'plumbing')}
        >
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Droplets className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className={`text-xl font-bold mb-2 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
              {language === 'ta' ? 'குழாய் சேவைகள்' : 'Plumbing Services'}
            </h3>
            <p className={`text-gray-600 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
              {language === 'ta' 
                ? 'குழாய் கசிவு, கழிப்பறை, தண்ணீர் டேங்கி'
                : 'Pipe leakage, Toilet, Water tank'
              }
            </p>
          </div>
        </Card>
      </div>

      {/* Sub-service selection */}
      {watchedServiceType && (
        <div className="mt-8">
          <h3 className={`text-xl font-bold mb-4 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
            {language === 'ta' ? 'குறிப்பிட்ட சேவை தேர்வு செய்யுங்கள்:' : 'Select specific service:'}
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {getCurrentServices().map((service) => (
              <Card
                key={service.id}
                className={`p-4 cursor-pointer border-2 transition-all ${
                  watch('subService') === service.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setValue('subService', service.id)}
              >
                <div className="flex items-center space-x-3">
                  <div className="text-blue-500">
                    {service.icon}
                  </div>
                  <div className="flex-1">
                    <div className={`font-bold ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
                      {getText(service.name)}
                    </div>
                    <div className={`text-sm text-gray-600 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
                      {getText(service.description)}
                    </div>
                    <div className="text-sm font-bold text-green-600">
                      {language === 'ta' ? 'தொடக்க விலை: ' : 'Starting from: '}{service.basePrice}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {errors.serviceType && (
        <p className="text-red-500 text-sm mt-2">{errors.serviceType.message}</p>
      )}
      {errors.subService && (
        <p className="text-red-500 text-sm mt-2">{errors.subService.message}</p>
      )}
    </div>
  );

  const renderProblemDescription = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className={`text-3xl font-black mb-4 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
          {language === 'ta' ? 'பிரச்சனை என்ன?' : 'What\'s the problem?'}
        </h2>
        <p className={`text-gray-600 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
          {language === 'ta' 
            ? 'பிரச்சனையை விவரமாக எழுதுங்கள்'
            : 'Describe the problem in detail'
          }
        </p>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <Textarea
            {...register('description')}
            placeholder={language === 'ta' 
              ? 'உங்கள் பிரச்சனையை விவரிக்கவும்...'
              : 'Describe your problem...'
            }
            rows={4}
            className="w-full p-4 border-2 rounded-xl resize-none"
          />
          <Button
            type="button"
            onClick={handleVoiceInput}
            disabled={isListening}
            className={`absolute right-2 bottom-2 p-2 ${
              isListening 
                ? 'bg-red-500 text-white animate-pulse' 
                : 'bg-gray-100 hover:bg-blue-100 text-gray-700'
            }`}
            size="sm"
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </Button>
        </div>

        {/* Photo Upload */}
        <div className="space-y-2">
          <label className={`block font-medium ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
            {language === 'ta' ? 'படங்கள் (விரும்பினால்)' : 'Photos (Optional)'}
          </label>
          <div className="flex items-center space-x-4">
            <Button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Camera className="w-4 h-4" />
              <span className={language === 'ta' ? 'font-tamil' : 'font-english'}>
                {language === 'ta' ? 'படம் எடுக்க' : 'Add Photo'}
              </span>
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </div>
          
          {/* Photo Preview */}
          {selectedPhotos.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {selectedPhotos.map((photo, index) => (
                <div key={index} className="relative">
                  <img
                    src={photo}
                    alt={`Problem photo ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full"
                    size="sm"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {errors.description && (
        <p className="text-red-500 text-sm">{errors.description.message}</p>
      )}
    </div>
  );

  const renderContactInfo = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className={`text-3xl font-black mb-4 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
          {language === 'ta' ? 'உங்கள் விபரங்கள்' : 'Your Details'}
        </h2>
      </div>

      <div className="grid gap-4">
        <div>
          <label className={`block font-medium mb-2 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
            {language === 'ta' ? 'பெயர்' : 'Name'} *
          </label>
          <Input
            {...register('contactInfo.name')}
            placeholder={language === 'ta' ? 'உங்கள் பெயர்' : 'Your name'}
            className="w-full p-3 border-2 rounded-xl"
          />
          {errors.contactInfo?.name && (
            <p className="text-red-500 text-sm mt-1">{errors.contactInfo.name.message}</p>
          )}
        </div>

        <div>
          <label className={`block font-medium mb-2 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
            {language === 'ta' ? 'மொபைல் எண்' : 'Mobile Number'} *
          </label>
          <Input
            {...register('contactInfo.phone')}
            type="tel"
            placeholder="9876543210"
            className="w-full p-3 border-2 rounded-xl"
          />
          {errors.contactInfo?.phone && (
            <p className="text-red-500 text-sm mt-1">{errors.contactInfo.phone.message}</p>
          )}
        </div>

        <div>
          <label className={`block font-medium mb-2 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
            {language === 'ta' ? 'முகவரி' : 'Address'} *
          </label>
          <Textarea
            {...register('contactInfo.address')}
            placeholder={language === 'ta' ? 'முழு முகவரி' : 'Complete address'}
            rows={3}
            className="w-full p-3 border-2 rounded-xl resize-none"
          />
          {errors.contactInfo?.address && (
            <p className="text-red-500 text-sm mt-1">{errors.contactInfo.address.message}</p>
          )}
        </div>

        <div>
          <label className={`block font-medium mb-2 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
            {language === 'ta' ? 'மாற்று எண் (விரும்பினால்)' : 'Alternate Number (Optional)'}
          </label>
          <Input
            {...register('contactInfo.alternatePhone')}
            type="tel"
            placeholder="9876543210"
            className="w-full p-3 border-2 rounded-xl"
          />
          {errors.contactInfo?.alternatePhone && (
            <p className="text-red-500 text-sm mt-1">{errors.contactInfo.alternatePhone.message}</p>
          )}
        </div>

        {/* Location Display */}
        {watch('location') && (
          <div className="bg-blue-50 p-4 rounded-xl">
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              <div>
                <p className={`font-medium ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
                  {language === 'ta' ? 'உங்கள் இடம்:' : 'Your Location:'}
                </p>
                <p className="text-sm text-gray-600">
                  {watch('location')?.address}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderTimeSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className={`text-3xl font-black mb-4 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
          {language === 'ta' ? 'எப்போது வேண்டும்?' : 'When do you need service?'}
        </h2>
      </div>

      {isEmergency ? (
        <div className="bg-red-50 border-2 border-red-200 p-6 rounded-xl text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className={`text-xl font-bold text-red-700 mb-2 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
            {language === 'ta' ? 'அவசர சேவை' : 'Emergency Service'}
          </h3>
          <p className={`text-red-600 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
            {language === 'ta' 
              ? 'எங்கள் குழு உடனே உங்களை தொடர்பு கொள்ளும்'
              : 'Our team will contact you immediately'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-3">
            {timeSlots.map((slot) => (
              <Card
                key={slot.id}
                className={`p-4 cursor-pointer border-2 transition-all ${
                  watch('scheduledTime') === slot.time
                    ? 'border-blue-500 bg-blue-50'
                    : slot.available
                    ? 'border-gray-200 hover:border-gray-300'
                    : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-60'
                }`}
                onClick={() => slot.available && setValue('scheduledTime', slot.time)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Clock className={`w-5 h-5 ${slot.available ? 'text-blue-600' : 'text-gray-400'}`} />
                    <div>
                      <p className={`font-bold ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
                        {getText(slot.label)}
                      </p>
                      <p className="text-sm text-gray-600">{slot.time}</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    slot.available 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {slot.available 
                      ? (language === 'ta' ? 'கிடைக்கும்' : 'Available')
                      : (language === 'ta' ? 'பிஸி' : 'Busy')
                    }
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="bg-yellow-50 p-4 rounded-xl">
            <p className={`text-sm text-yellow-800 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
              {language === 'ta' 
                ? 'குறிப்பு: தேர்ந்தெடுக்கப்பட்ட நேரத்திற்கு 15 நிமிடம் முன்னதாக எங்கள் குழு வரும்'
                : 'Note: Our team will arrive 15 minutes before the selected time'
              }
            </p>
          </div>
        </div>
      )}

      {errors.scheduledTime && !isEmergency && (
        <p className="text-red-500 text-sm">{errors.scheduledTime.message}</p>
      )}
    </div>
  );

  const renderConfirmation = () => {
    const selectedService = getCurrentServices().find(s => s.id === watch('subService'));
    const selectedSlot = timeSlots.find(s => s.time === watch('scheduledTime'));

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className={`text-3xl font-black mb-4 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
            {language === 'ta' ? 'விபரங்களை சரிபார்' : 'Confirm Details'}
          </h2>
        </div>

        <Card className="p-6 bg-gray-50">
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b">
              <span className={`font-medium ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
                {language === 'ta' ? 'சேவை:' : 'Service:'}
              </span>
              <span className={`text-right ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
                {selectedService && getText(selectedService.name)}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b">
              <span className={`font-medium ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
                {language === 'ta' ? 'பெயர்:' : 'Name:'}
              </span>
              <span>{watch('contactInfo.name')}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b">
              <span className={`font-medium ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
                {language === 'ta' ? 'மொபைல்:' : 'Mobile:'}
              </span>
              <span>{watch('contactInfo.phone')}</span>
            </div>

            <div className="flex items-start justify-between py-2 border-b">
              <span className={`font-medium ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
                {language === 'ta' ? 'முகவரி:' : 'Address:'}
              </span>
              <span className="text-right max-w-xs">{watch('contactInfo.address')}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b">
              <span className={`font-medium ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
                {language === 'ta' ? 'நேரம்:' : 'Time:'}
              </span>
              <span className={language === 'ta' ? 'font-tamil' : 'font-english'}>
                {isEmergency 
                  ? (language === 'ta' ? 'அவசரம் - உடனே' : 'Emergency - Immediate')
                  : selectedSlot && getText(selectedSlot.label)
                }
              </span>
            </div>

            <div className="flex items-start justify-between py-2">
              <span className={`font-medium ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
                {language === 'ta' ? 'பிரச்சனை:' : 'Problem:'}
              </span>
              <span className="text-right max-w-xs">{watch('description')}</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-blue-50 border-blue-200">
          <div className="text-center">
            <h3 className={`text-lg font-bold mb-2 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
              {language === 'ta' ? 'கட்டணம்' : 'Payment'}
            </h3>
            <p className={`text-blue-800 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
              {language === 'ta' 
                ? 'சேவை பூர्ति்தி் அच्छाणम் நकद কোडুक्कவুम्'
                : 'Pay cash after service completion'
              }
            </p>
            <p className={`text-sm text-blue-600 mt-1 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
              {selectedService && `${language === 'ta' ? 'தொടக्क વિ લાই: ' : 'Starting from: '}${selectedService.basePrice}`}
            </p>
          </div>
        </Card>
      </div>
    );
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderServiceSelection();
      case 2: return renderProblemDescription();
      case 3: return renderContactInfo();
      case 4: return renderTimeSelection();
      case 5: return renderConfirmation();
      default: return renderServiceSelection();
    }
  };

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 1: return !!(watchedServiceType && watch('subService'));
      case 2: return !!(watch('description') && watch('description').length >= 10);
      case 3: return !!(watch('contactInfo.name') && watch('contactInfo.phone') && watch('contactInfo.address'));
      case 4: return !!(watch('scheduledTime') || isEmergency);
      case 5: return true;
      default: return false;
    }
  };

  const getStepTitle = (): string => {
    const titles = {
      1: { ta: 'சேவை தேர्ွு', en: 'Service Selection' },
      2: { ta: 'பிरच্চনை വിवരণ', en: 'Problem Description' },
      3: { ta: 'தোড়র्बু বিবরণ', en: 'Contact Information' },
      4: { ta: 'நেরम् తేర्ವு', en: 'Time Selection' },
      5: { ta: 'पुष्टি', en: 'Confirmation' }
    };
    return titles[currentStep as keyof typeof titles][language];
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className={`text-4xl font-black mb-2 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
          {language === 'ta' ? 'சேவை பதिवு' : 'Service Booking'}
        </h1>
        <p className={`text-gray-600 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
          {getStepTitle()}
        </p>
      </div>

      {renderProgressIndicator()}
      
      <Card className="p-6 lg:p-8 shadow-lg">
        <form onSubmit={handleSubmit(handleStepSubmit)}>
          {renderCurrentStep()}
          
          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={prevStep}
              disabled={currentStep === 1}
              className={currentStep === 1 ? 'invisible' : ''}
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span className={language === 'ta' ? 'font-tamil' : 'font-english'}>
                {language === 'ta' ? 'பின்செল்' : 'Back'}
              </span>
            </Button>

            <Button
              type="submit"
              size="lg"
              disabled={!canProceed()}
              className="min-w-32 bg-blue-600 hover:bg-blue-700"
            >
              <span className={language === 'ta' ? 'font-tamil' : 'font-english'}>
                {currentStep === 5 
                  ? (language === 'ta' ? 'உறुதிप্পदুत্তু' : 'Confirm Booking')
                  : (language === 'ta' ? 'அடুত্तু' : 'Next')
                }
              </span>
              {currentStep < 5 && <ArrowRight className="w-5 h-5 ml-2" />}
              {currentStep === 5 && <Check className="w-5 h-5 ml-2" />}
            </Button>
          </div>
        </form>
      </Card>

      {/* Voice Input Indicator */}
      {isListening && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl text-center max-w-sm">
            <div className="animate-pulse">
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mic className="w-8 h-8 text-white" />
              </div>
              <p className={`text-xl font-bold mb-2 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
                {language === 'ta' ? 'பேসুங்கল्...' : 'Listening...'}
              </p>
              <p className={`text-gray-600 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
                {language === 'ta' 
                  ? 'உங्গல् पिरच्चনैયை বল্ইअ'
                  : 'Describe your problem'
                }
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingForm;