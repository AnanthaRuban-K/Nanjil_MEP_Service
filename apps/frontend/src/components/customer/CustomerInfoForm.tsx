// apps/frontend/src/components/customer/CustomerInfoForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../stores/auth-store';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { ArrowLeft, Mic, MapPin } from 'lucide-react';

interface ContactInfo {
  name: string;
  phone: string;
  address: string;
}

export const CustomerInfoForm: React.FC = () => {
  const router = useRouter();
  const { language, user } = useAuthStore();
  
  const [formData, setFormData] = useState<ContactInfo>({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });
  const [isListening, setIsListening] = useState<'name' | 'address' | null>(null);

  useEffect(() => {
    const savedData = sessionStorage.getItem('bookingData');
    if (savedData) {
      const bookingData = JSON.parse(savedData);
      if (bookingData.contactInfo) {
        setFormData(bookingData.contactInfo);
      }
    }
  }, []);

  const handleInputChange = (field: keyof ContactInfo, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleVoiceInput = (field: 'name' | 'address') => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert(language === 'ta' 
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

    setIsListening(field);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      handleInputChange(field, transcript);
    };

    recognition.onerror = () => setIsListening(null);
    recognition.onend = () => setIsListening(null);
    recognition.start();
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationText = `${formData.address}, Lat: ${position.coords.latitude.toFixed(6)}, Lng: ${position.coords.longitude.toFixed(6)}`;
          handleInputChange('address', locationText);
        },
        (error) => {
          alert(language === 'ta' 
            ? 'இடம் பெற முடியவில்லை'
            : 'Cannot get location'
          );
        }
      );
    }
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      alert(language === 'ta' ? 'பெயர் அவசியம்' : 'Name is required');
      return false;
    }
    if (!formData.phone.trim()) {
      alert(language === 'ta' ? 'மொபைல் எண் அவசியம்' : 'Mobile number is required');
      return false;
    }
    if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      alert(language === 'ta' ? 'சரியான மொபைல் எண் கொடுக்கவும்' : 'Please enter valid mobile number');
      return false;
    }
    if (!formData.address.trim()) {
      alert(language === 'ta' ? 'முகவரி அவசியம்' : 'Address is required');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (!validateForm()) return;

    const savedData = sessionStorage.getItem('bookingData');
    const bookingData = savedData ? JSON.parse(savedData) : {};
    
    const updatedData = {
      ...bookingData,
      contactInfo: formData
    };
    
    sessionStorage.setItem('bookingData', JSON.stringify(updatedData));
    router.push('/schedule');
  };

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
            {language === 'ta' ? 'உங்கள் விபரங்கள்' : 'Your Details'}
          </h1>
          <p className="text-lg text-gray-600">
            {language === 'ta' 
              ? 'எங்கள் குழு உங்களை தொடர்பு கொள்ள'
              : 'For our team to contact you'
            }
          </p>
        </div>

        <Card className="mb-8">
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-lg font-bold mb-2">
                {language === 'ta' ? 'பெயர் (Name):' : 'Name:'}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder={language === 'ta' ? 'உங்கள் பெயர்' : 'Your Name'}
                  className="flex-1 px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <Button
                  variant="outline"
                  onClick={() => handleVoiceInput('name')}
                  disabled={isListening === 'name'}
                  className={`px-3 ${isListening === 'name' ? 'animate-pulse' : ''}`}
                >
                  <Mic className={`w-4 h-4 ${isListening === 'name' ? 'text-red-600' : ''}`} />
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-lg font-bold mb-2">
                {language === 'ta' ? 'மொபைல் எண் (Mobile):' : 'Mobile Number:'}
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="98765 12345"
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                maxLength={15}
              />
            </div>

            <div>
              <label className="block text-lg font-bold mb-2">
                {language === 'ta' ? 'முகவரி (Address):' : 'Address:'}
              </label>
              <div className="flex gap-2 mb-2">
                <textarea
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder={language === 'ta' ? 'வீட்டு முகவரி' : 'House Address'}
                  className="flex-1 px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 h-24 resize-none"
                />
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleVoiceInput('address')}
                    disabled={isListening === 'address'}
                    className={`px-3 ${isListening === 'address' ? 'animate-pulse' : ''}`}
                  >
                    <Mic className={`w-4 h-4 ${isListening === 'address' ? 'text-red-600' : ''}`} />
                  </Button>
                  <Button variant="outline" onClick={getCurrentLocation} className="px-3">
                    <MapPin className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Button onClick={handleNext} size="lg" className="w-full" disabled={!formData.name || !formData.phone || !formData.address}>
          <span className="text-lg font-bold">
            {language === 'ta' ? 'அடுத்து: நேரம் தேர்வு →' : 'Next: Select Time →'}
          </span>
        </Button>
      </div>
    </div>
  );
};