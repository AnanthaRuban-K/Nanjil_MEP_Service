// apps/frontend/src/components/customer/ProblemDescriptionForm.tsx
'use client';

import React, { useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '../../stores/auth-store';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { ArrowLeft, Mic, Camera, Upload } from 'lucide-react';
import type { ServiceType } from '../../types';
import { Priority } from './BookingSummary';

interface QuickIssue {
  id: string;
  tamil: string;
  english: string;
  service: ServiceType;
}

export const ProblemDescriptionForm: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language } = useAuthStore();
  
  const [description, setDescription] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get service type from URL params
  const serviceType = searchParams.get('service') as ServiceType || 'electrical';
  const priority = searchParams.get('priority') as Priority || 'normal';

  const quickIssues: QuickIssue[] = [
    // Electrical issues
    { id: 'fan-not-working', tamil: 'விசிறி ஓடவில்லை', english: 'Fan Not Working', service: 'electrical' },
    { id: 'light-not-on', tamil: 'விளக்கு எரியவில்லை', english: 'Light Not On', service: 'electrical' },
    { id: 'switch-problem', tamil: 'சுவிட்ச் பிரச்சினை', english: 'Switch Problem', service: 'electrical' },
    { id: 'power-cut', tamil: 'பவர் கட்', english: 'Power Cut', service: 'electrical' },
    { id: 'wiring-issue', tamil: 'வயரிங் பிரச்சினை', english: 'Wiring Issue', service: 'electrical' },
    
    // Plumbing issues
    { id: 'tap-leaking', tamil: 'குழாய் கசிவு', english: 'Tap Leaking', service: 'plumbing' },
    { id: 'toilet-blocked', tamil: 'டாய்லெட் அடைப்பு', english: 'Toilet Blocked', service: 'plumbing' },
    { id: 'no-water', tamil: 'தண்ணீர் வரவில்லை', english: 'No Water', service: 'plumbing' },
    { id: 'pipe-burst', tamil: 'குழாய் வெடித்தது', english: 'Pipe Burst', service: 'plumbing' },
    { id: 'drain-blocked', tamil: 'வடிகால் அடைப்பு', english: 'Drain Blocked', service: 'plumbing' },
  ];

  const filteredIssues = quickIssues.filter(issue => issue.service === serviceType);

  const handleVoiceInput = () => {
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

    setIsListening(true);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setDescription(prev => prev + (prev ? ' ' : '') + transcript);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length + selectedPhotos.length > 3) {
      alert(language === 'ta' 
        ? 'அதிகபட்சம் 3 புகைப்படங்கள் மட்டுமே'
        : 'Maximum 3 photos only'
      );
      return;
    }
    setSelectedPhotos(prev => [...prev, ...files]);
  };

  const removePhoto = (index: number) => {
    setSelectedPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleQuickIssueSelect = (issue: QuickIssue) => {
    const issueText = language === 'ta' ? issue.tamil : issue.english;
    setDescription(prev => prev ? `${prev}. ${issueText}` : issueText);
  };

  const handleNext = () => {
    if (!description.trim()) {
      alert(language === 'ta' 
        ? 'பிரச்சினையை விவரிக்கவும்'
        : 'Please describe the problem'
      );
      return;
    }

    // Store form data and navigate to next step
    const formData = {
      serviceType,
      priority,
      description,
      photos: selectedPhotos
    };
    
    // In a real app, you'd store this in a form store or context
    sessionStorage.setItem('bookingData', JSON.stringify(formData));
    router.push('/contact');
  };

  const serviceTitle = serviceType === 'electrical' 
    ? (language === 'ta' ? 'மின்சாரம்' : 'Electrical')
    : (language === 'ta' ? 'குழாய்' : 'Plumbing');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="max-w-2xl mx-auto p-4">
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
        <div className="text-center mb-8">
          <h1 className={`text-3xl font-black mb-2 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
            {language === 'ta' ? 'பிரச்சனை என்ன?' : "What's the Problem?"}
          </h1>
          <p className={`text-lg text-gray-600 mb-4 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
            {language === 'ta' ? 'சேவை:' : 'Service:'} 
            <span className="font-bold text-primary-600 ml-2">
              {serviceTitle}
            </span>
          </p>
          {priority === 'emergency' && (
            <div className="bg-red-100 border border-red-300 rounded-lg p-2 mb-4">
              <span className={`text-red-700 font-bold ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
                🚨 {language === 'ta' ? 'அவசர சேவை' : 'Emergency Service'}
              </span>
            </div>
          )}
        </div>

        {/* Problem Description */}
        <Card className="mb-6">
          <div className="p-6">
            <label className={`block text-lg font-bold mb-4 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
              {language === 'ta' ? 'பிரச்சனையை விவரிக்கவும்...' : 'Describe the problem...'}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={language === 'ta' 
                ? 'உங்கள் பிரச்சினையை விரிவாக எழுதுங்கள்...'
                : 'Write your problem in detail...'
              }
              className={`w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                language === 'ta' ? 'font-tamil' : 'font-english'
              }`}
              maxLength={500}
            />
            <div className="text-sm text-gray-500 text-right mt-2">
              {description.length}/500
            </div>

            {/* Voice and Photo Input */}
            <div className="flex gap-4 mt-4">
              <Button
                variant="outline"
                onClick={handleVoiceInput}
                disabled={isListening}
                className={`flex-1 ${isListening ? 'animate-pulse' : ''}`}
              >
                <Mic className={`w-4 h-4 mr-2 ${isListening ? 'text-red-600' : ''}`} />
                <span className={language === 'ta' ? 'font-tamil' : 'font-english'}>
                  {isListening 
                    ? (language === 'ta' ? 'கேட்டுக்கொண்டிருக்கிறது...' : 'Listening...')
                    : (language === 'ta' ? 'வாய்ஸ் இன்புட்' : 'Voice Input')
                  }
                </span>
              </Button>

              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1"
              >
                <Camera className="w-4 h-4 mr-2" />
                <span className={language === 'ta' ? 'font-tamil' : 'font-english'}>
                  {language === 'ta' ? 'புகைப்படம்' : 'Add Photo'}
                </span>
              </Button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />

            {/* Selected Photos */}
            {selectedPhotos.length > 0 && (
              <div className="mt-4">
                <p className={`text-sm font-medium mb-2 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
                  {language === 'ta' ? 'தேர்ந்தெடுத்த புகைப்படங்கள்:' : 'Selected Photos:'}
                </p>
                <div className="flex gap-2">
                  {selectedPhotos.map((file, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Upload ${index + 1}`}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removePhoto(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Quick Issues */}
        <Card className="mb-8">
          <div className="p-6">
            <h3 className={`text-lg font-bold mb-4 ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
              {language === 'ta' ? 'பொதுவான பிரச்சினைகள்:' : 'Common Issues:'}
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {filteredIssues.map((issue) => (
                <Button
                  key={issue.id}
                  variant="outline"
                  onClick={() => handleQuickIssueSelect(issue)}
                  className="text-left justify-start h-auto p-3"
                >
                  <span className={language === 'ta' ? 'font-tamil' : 'font-english'}>
                    {language === 'ta' ? issue.tamil : issue.english}
                  </span>
                </Button>
              ))}
            </div>
          </div>
        </Card>

        {/* Next Button */}
        <Button
          onClick={handleNext}
          size="lg"
          className="w-full"
          disabled={!description.trim()}
        >
          <span className={`text-lg font-bold ${language === 'ta' ? 'font-tamil' : 'font-english'}`}>
            {language === 'ta' ? 'அடுத்து: உங்கள் விபரங்கள் →' : 'Next: Your Details →'}
          </span>
        </Button>
      </div>
    </div>
  );
};

