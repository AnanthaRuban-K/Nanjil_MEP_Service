import crypto from 'crypto'
import type { Language, Booking } from '../types'

// OTP Generation
export function generateOTP(): string {
  return crypto.randomInt(100000, 999999).toString()
}

// Define SMS template type
type SMSTemplates = {
  [key in 'otp' | 'booking_created' | 'team_assigned' | 'job_completed' | 'booking_cancelled']: {
    ta: string
    en: string
  }
}

// SMS Templates
const smsTemplates: SMSTemplates = {
  otp: {
    ta: 'உங்கள் நாஞ்சில் MEP OTP: {otp}. 5 நிமிடத்தில் காலாவதியாகும். பகிர்ந்து கொள்ள வேண்டாம்.',
    en: 'Your Nanjil MEP OTP: {otp}. Expires in 5 minutes. Do not share.'
  },
  booking_created: {
    ta: 'உங்கள் பதிவு {bookingNumber} உறுதி! எங்கள் குழு விரைவில் அழைக்கும். நன்றி - நாஞ்சில் MEP',
    en: 'Booking {bookingNumber} confirmed! Our team will call you soon. Thanks - Nanjil MEP'
  },
  team_assigned: {
    ta: 'உங்கள் பதிவு {bookingNumber}க்கு {teamName} குழு நியமிக்கப்பட்டுள்ளது. தொடர்பு: {phone}. நேரம்: {eta}',
    en: 'Team {teamName} assigned to booking {bookingNumber}. Contact: {phone}. ETA: {eta}'
  },
  job_completed: {
    ta: 'உங்கள் வேலை {bookingNumber} வெற்றிகரமாக முடிந்தது! கட்டணம்: ₹{amount}. மதிப்பீடு கொடுக்கவும்.',
    en: 'Job {bookingNumber} completed successfully! Payment: ₹{amount}. Please rate our service.'
  },
  booking_cancelled: {
    ta: 'உங்கள் பதிவு {bookingNumber} ரத்து செய்யப்பட்டது. தயவு செய்து மீண்டும் பதிவு செய்யவும்.',
    en: 'Your booking {bookingNumber} has been cancelled. Please rebook if needed.'
  }
}

// Mock SMS sending function
export async function sendSMS(phone: string, message: string, language: Language = 'ta'): Promise<boolean> {
  try {
    console.log(`📩 SMS to ${phone} (${language}): ${message}`)
    await new Promise(resolve => setTimeout(resolve, 500))
    return true
  } catch (error) {
    console.error('❌ SMS sending failed:', error)
    return false
  }
}

// OTP
export async function sendOTP(phone: string, otp: string, language: Language): Promise<boolean> {
  const template = smsTemplates.otp[language]
  const message = template.replace('{otp}', otp)
  return await sendSMS(phone, message, language)
}

// Booking Notifications
export async function sendBookingNotification(
  booking: Booking,
  type: 'created' | 'team_assigned' | 'completed' | 'cancelled',
  language: Language
): Promise<boolean> {
  const phone = booking.contactInfo?.phone
  if (!phone) return false

  let template: string | undefined
  switch (type) {
    case 'created':
      template = smsTemplates.booking_created[language]
      break
    case 'team_assigned':
      template = smsTemplates.team_assigned[language]
      break
    case 'completed':
      template = smsTemplates.job_completed[language]
      break
    case 'cancelled':
      template = smsTemplates.booking_cancelled[language]
      break
  }

  if (!template) return false

  // Replace placeholders
  let message = template
    .replace('{bookingNumber}', booking.bookingNumber || 'NA')
    .replace('{teamName}', booking.assignedTeam?.name || 'Team')
    .replace('{phone}', booking.assignedTeam?.phone || 'N/A')
    .replace('{eta}', booking.eta || '30 mins')
    .replace('{amount}', booking.finalPrice?.toString() || '0')

  return await sendSMS(phone, message, language)
}
