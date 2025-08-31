// apps/frontend/src/components/customer/ProblemDescriptionForm.tsx
'use client'

import React, { useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '../../stores/auth-store'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { ArrowLeft, Mic } from 'lucide-react'
import type { ServiceType } from '../../types'
import { Priority } from './BookingSummary'

interface QuickIssue {
  id: string
  tamil: string
  english: string
  service: ServiceType
}

export const ProblemDescriptionForm: React.FC = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { language } = useAuthStore()

  const [description, setDescription] = useState('')
  const [isListening, setIsListening] = useState(false)

  // Service & Priority from URL
  const serviceType = (searchParams.get('service') as ServiceType) || 'electrical'
  const priority = (searchParams.get('priority') as Priority) || 'normal'

  const quickIssues: QuickIssue[] = [
    { id: 'fan-not-working', tamil: 'விசிறி ஓடவில்லை', english: 'Fan Not Working', service: 'electrical' },
    { id: 'light-not-on', tamil: 'விளக்கு எரியவில்லை', english: 'Light Not On', service: 'electrical' },
    { id: 'switch-problem', tamil: 'சுவிட்ச் பிரச்சினை', english: 'Switch Problem', service: 'electrical' },
    { id: 'tap-leaking', tamil: 'குழாய் கசிவு', english: 'Tap Leaking', service: 'plumbing' },
    { id: 'toilet-blocked', tamil: 'டாய்லெட் அடைப்பு', english: 'Toilet Blocked', service: 'plumbing' },
  ]

  const filteredIssues = quickIssues.filter((issue) => issue.service === serviceType)

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert(language === 'ta' ? 'வாய்ஸ் இன்புட் ஆதரிக்கப்படவில்லை' : 'Voice input not supported')
      return
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.lang = language === 'ta' ? 'ta-IN' : 'en-IN'
    recognition.continuous = false
    recognition.interimResults = false

    setIsListening(true)

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setDescription((prev) => prev + (prev ? ' ' : '') + transcript)
    }

    recognition.onerror = () => setIsListening(false)
    recognition.onend = () => setIsListening(false)

    recognition.start()
  }

  const handleQuickIssueSelect = (issue: QuickIssue) => {
    const issueText = language === 'ta' ? issue.tamil : issue.english
    setDescription((prev) => (prev ? `${prev}. ${issueText}` : issueText))
  }

  // Save data and go to next step (CustomerInfoForm)
  const handleNext = () => {
    if (!description.trim()) {
      alert(language === 'ta' ? 'பிரச்சினையை விவரிக்கவும்' : 'Please describe the problem')
      return
    }

    // Save booking data to sessionStorage
    const bookingData = {
      serviceType,
      priority,
      description: description.trim()
    }

    sessionStorage.setItem('bookingData', JSON.stringify(bookingData))
    
    // Navigate to customer info form
    router.push('/contact')
  }

  const serviceTitle = serviceType === 'electrical'
    ? (language === 'ta' ? 'மின்சாரம்' : 'Electrical')
    : (language === 'ta' ? 'குழாய்' : 'Plumbing')

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
          <h1 className="text-3xl font-black mb-2">{language === 'ta' ? 'பிரச்சனை என்ன?' : "What's the Problem?"}</h1>
          <p className="text-lg text-gray-600 mb-4">
            {language === 'ta' ? 'சேவை:' : 'Service:'}{' '}
            <span className="font-bold text-primary-600 ml-2">{serviceTitle}</span>
          </p>
          {priority === 'emergency' && (
            <div className="bg-red-100 border border-red-300 rounded-lg p-2 mb-4">
              <span className="text-red-700 font-bold">🚨 {language === 'ta' ? 'அவசர சேவை' : 'Emergency Service'}</span>
            </div>
          )}
        </div>

        <Card className="mb-6">
          <div className="p-6">
            <label className="block text-lg font-bold mb-4">
              {language === 'ta' ? 'பிரச்சனையை விவரிக்கவும்...' : 'Describe the problem...'}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={language === 'ta' ? 'உங்கள் பிரச்சினையை விரிவாக எழுதுங்கள்...' : 'Write your problem in detail...'}
              className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              maxLength={500}
            />
            <div className="text-sm text-gray-500 text-right mt-2">{description.length}/500</div>

            <div className="flex gap-4 mt-4">
              <Button 
                variant="outline" 
                onClick={handleVoiceInput} 
                disabled={isListening} 
                className={`flex-1 ${isListening ? 'animate-pulse' : ''}`}
              >
                <Mic className={`w-4 h-4 mr-2 ${isListening ? 'text-red-600' : ''}`} />
                {isListening 
                  ? (language === 'ta' ? 'கேட்டுக்கொண்டிருக்கிறது...' : 'Listening...') 
                  : (language === 'ta' ? 'வாய்ஸ் இன்புட்' : 'Voice Input')
                }
              </Button>
            </div>
          </div>
        </Card>

        <Card className="mb-8">
          <div className="p-6">
            <h3 className="text-lg font-bold mb-4">{language === 'ta' ? 'பொதுவான பிரச்சினைகள்:' : 'Common Issues:'}</h3>
            <div className="grid grid-cols-1 gap-2">
              {filteredIssues.map((issue) => (
                <Button 
                  key={issue.id} 
                  variant="outline" 
                  onClick={() => handleQuickIssueSelect(issue)} 
                  className="text-left justify-start h-auto p-3"
                >
                  {language === 'ta' ? issue.tamil : issue.english}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        {/* Next Button - goes to CustomerInfoForm */}
        <Button onClick={handleNext} size="lg" className="w-full">
          <span className="text-lg font-bold">
            {language === 'ta' ? 'அடுத்து: உங்கள் விபரங்கள் →' : 'Next: Your Details →'}
          </span>
        </Button>
      </div>
    </div>
  )
}