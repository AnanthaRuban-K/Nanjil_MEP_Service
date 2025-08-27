export type TranslationKey = 
  | 'common.loading'
  | 'common.error'
  | 'common.success'
  | 'common.cancel'
  | 'common.confirm'
  | 'common.save'
  | 'common.back'
  | 'common.next'
  | 'common.submit'
  | 'services.electrical'
  | 'services.plumbing'
  | 'services.emergency'
  | 'booking.new'
  | 'booking.confirmed'
  | 'booking.pending'
  | 'booking.completed'
  | 'booking.cancelled'
  | 'status.available'
  | 'status.busy'
  | 'status.offline';

export const translations = {
  ta: {
    'common.loading': 'ஏற்றுகிறது...',
    'common.error': 'பிழை',
    'common.success': 'வெற்றி',
    'common.cancel': 'இரத்து செய்',
    'common.confirm': 'உறுதிப்படுத்து',
    'common.save': 'சேமி',
    'common.back': 'பின் செல்',
    'common.next': 'அடுத்து',
    'common.submit': 'சமர்ப்பி',
    'services.electrical': 'மின்சாரம்',
    'services.plumbing': 'குழாய்',
    'services.emergency': 'அவசரம்',
    'booking.new': 'புதிய பதிவு',
    'booking.confirmed': 'உறுதிப்படுத்தப்பட்டது',
    'booking.pending': 'காத்திருக்கும்',
    'booking.completed': 'முடிந்தது',
    'booking.cancelled': 'இரத்து செய்யப்பட்டது',
    'status.available': 'கிடைக்கிறது',
    'status.busy': 'பிசி',
    'status.offline': 'ஆஃப்லைன்'
  },
  en: {
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.save': 'Save',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.submit': 'Submit',
    'services.electrical': 'Electrical',
    'services.plumbing': 'Plumbing',
    'services.emergency': 'Emergency',
    'booking.new': 'New Booking',
    'booking.confirmed': 'Confirmed',
    'booking.pending': 'Pending',
    'booking.completed': 'Completed',
    'booking.cancelled': 'Cancelled',
    'status.available': 'Available',
    'status.busy': 'Busy',
    'status.offline': 'Offline'
  }
};

export const translate = (key: TranslationKey, locale: 'ta' | 'en' = 'ta'): string => {
  return translations[locale][key] || key;
};