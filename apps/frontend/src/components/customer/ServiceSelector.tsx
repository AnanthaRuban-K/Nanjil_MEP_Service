// apps/frontend/src/components/customer/ServiceSelector.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../stores/auth-store';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Zap, Droplets, AlertTriangle, ArrowLeft } from 'lucide-react';
import type { ServiceType } from '../../types';

interface ServiceOption {
  type: ServiceType;
  icon: React.ReactNode;
  titleTa: string;
  titleEn: string;
  descriptionTa: string;
  descriptionEn: string;
  examples: {
    ta: string[];
    en: string[];
  };
  bgColor: string;
  iconBg: string;
  borderColor: string;
  hoverBorder: string;
}

export const ServiceSelector: React.FC = () => {
  const router = useRouter();
  const { language } = useAuthStore();

  const services: ServiceOption[] = [
    {
      type: 'electrical',
      icon: <Zap className="w-16 h-16 text-white" />,
      titleTa: 'மின்சாரம்',
      titleEn: 'ELECTRICAL',
      descriptionTa: 'மின் சம்பந்தமான அனைத்து பணிகள்',
      descriptionEn: 'All electrical related work',
      examples: {
        ta: ['விசிறி', 'விளக்கு', 'சுவிட்ச்', 'வயரிங்'],
        en: ['Fan', 'Lights', 'Switch', 'Wiring']
      },
      bgColor: 'from-electrical-50 to-yellow-50',
      iconBg: 'bg-electrical-500',
      borderColor: 'border-electrical-200',
      hoverBorder: 'hover:border-electrical-500'
    },
    {
      type: 'plumbing',
      icon: <Droplets className="w-16 h-16 text-white" />,
      titleTa: 'குழாய்',
      titleEn: 'PLUMBING',
      descriptionTa: 'தண்ணீர் சம்பந்தமான அனைத்து பணிகள்',
      descriptionEn: 'All water related work',
      examples: {
        ta: ['குழாய்', 'கழிவறை', 'லீக்கேஜ்', 'டேங்கி'],
        en: ['Pipe', 'Toilet', 'Leakage', 'Tank']
      },
      bgColor: 'from-plumbing-50 to-blue-50',
      iconBg: 'bg-plumbing-500',
      borderColor: 'border-plumbing-200',
      hoverBorder: 'hover:border-plumbing-500'
    }
  ];

  const handleServiceSelect = (serviceType: ServiceType) => {
    // Store selected service type in URL params
    router.push(`/describe?service=${serviceType}`);
  };

  const handleEmergencyService = () => {
    router.push(`/describe?service=electrical&priority=emergency`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="max-w-4xl mx-auto p-4">
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
        <div className="text-center mb-12">
          <h1 className={`text-4xl font-black mb-4 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
            {language === 'ta' ? 'எந்த சேவை வேண்டும்?' : 'Which Service?'}
          </h1>
          <p className={`text-lg text-gray-600 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
            {language === 'ta' 
              ? 'உங்களுக்கு தேவையான சேவையை தேர்ந்தெடுக்கவும்'
              : 'Choose the service you need'
            }
          </p>
        </div>

        {/* Service Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {services.map((service) => (
            <Card
              key={service.type}
              hover
              className={`group cursor-pointer border-4 ${service.borderColor} ${service.hoverBorder} bg-gradient-to-br ${service.bgColor}`}
              onClick={() => handleServiceSelect(service.type)}
            >
              <div className="p-8">
                {/* Service Header */}
                <div className="flex flex-col items-center text-center mb-6">
                  <div className={`${service.iconBg} rounded-full p-6 mb-4 group-hover:scale-110 transition-transform`}>
                    {service.icon}
                  </div>
                  <h2 className={`text-3xl font-black mb-2 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
                    {language === 'ta' ? service.titleTa : service.titleEn}
                  </h2>
                  <p className={`text-gray-600 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
                    {language === 'ta' ? service.descriptionTa : service.descriptionEn}
                  </p>
                </div>

                {/* Service Examples */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {(language === 'ta' ? service.examples.ta : service.examples.en).map((example, index) => (
                    <div key={index} className="bg-white rounded-lg p-3 text-center shadow-soft">
                      <span className={`font-medium text-gray-800 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
                        {example}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Select Button */}
                <Button
                  variant={service.type === 'electrical' ? 'electrical' : 'plumbing'}
                  size="lg"
                  className="w-full"
                >
                  <span className={`text-lg font-bold ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
                    {language === 'ta' ? 'இந்த சேவையை தேர்வு செய்க' : 'Select This Service'}
                  </span>
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Emergency Service */}
        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0 shadow-large">
          <div className="p-8 text-center">
            <div className="mb-4">
              <AlertTriangle className="w-12 h-12 mx-auto text-white animate-pulse" />
            </div>
            <h3 className={`text-3xl font-black mb-4 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
              {language === 'ta' ? '🚨 அவசரம்' : '🚨 EMERGENCY'}
            </h3>
            <p className={`text-lg mb-6 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
              {language === 'ta' 
                ? '24 மணி நேரம் • உடனடி சேவை'
                : '24 Hours • Immediate Service'
              }
            </p>
            <Button
              onClick={handleEmergencyService}
              variant="secondary"
              size="xl"
              className="bg-white text-red-600 hover:bg-gray-100 font-black"
            >
              <span className={language === 'ta' ? 'font-tamil' : 'font-english'}>
                {language === 'ta' ? 'அவசர சேவை பதிவு' : 'Book Emergency Service'}
              </span>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};