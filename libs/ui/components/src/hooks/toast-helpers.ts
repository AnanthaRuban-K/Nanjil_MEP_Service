// libs/ui/components/src/hooks/toast-helpers.ts - Convenient Toast Functions
import { toast } from './use-toast';

// Toast helper functions with Tamil/English support
export const showToast = {
  success: (title: string, description?: string) => {
    return toast({
      variant: 'success',
      title,
      description,
    });
  },

  error: (title: string, description?: string) => {
    return toast({
      variant: 'destructive',
      title,
      description,
    });
  },

  warning: (title: string, description?: string) => {
    return toast({
      variant: 'warning',
      title,
      description,
    });
  },

  info: (title: string, description?: string) => {
    return toast({
      variant: 'default',
      title,
      description,
    });
  },
};

// Bilingual toast messages for common scenarios
export const toastMessages = {
  success: {
    saved: {
      ta: { title: 'சேமிக்கப்பட்டது!', description: 'உங்கள் தகவல் வெற்றிகரமாக சேமிக்கப்பட்டது' },
      en: { title: 'Saved!', description: 'Your information has been saved successfully' }
    },
    updated: {
      ta: { title: 'புதுப்பிக்கப்பட்டது!', description: 'மாற்றங்கள் வெற்றிகரமாக சேமிக்கப்பட்டன' },
      en: { title: 'Updated!', description: 'Changes have been saved successfully' }
    },
    deleted: {
      ta: { title: 'நீக்கப்பட்டது!', description: 'வெற்றிகரமாக நீக்கப்பட்டது' },
      en: { title: 'Deleted!', description: 'Successfully deleted' }
    },
    booked: {
      ta: { title: 'பதிவு முடிந்தது!', description: 'உங்கள் சேவை வெற்றிகரமாக பதிவு செய்யப்பட்டது' },
      en: { title: 'Booking Confirmed!', description: 'Your service has been booked successfully' }
    }
  },
  error: {
    failed: {
      ta: { title: 'தோல்வி!', description: 'ஏதோ தவறு ஏற்பட்டுள்ளது. மீண்டும் முயற்சிக்கவும்' },
      en: { title: 'Failed!', description: 'Something went wrong. Please try again' }
    },
    network: {
      ta: { title: 'இணையத்தில் பிரச்சனை!', description: 'இணைய இணைப்பைச் சரிபார்க்கவும்' },
      en: { title: 'Network Error!', description: 'Please check your internet connection' }
    },
    validation: {
      ta: { title: 'தவறான தகவல்!', description: 'கொடுக்கப்பட்ட தகவல்களைச் சரிபார்க்கவும்' },
      en: { title: 'Invalid Information!', description: 'Please check the provided information' }
    }
  },
  warning: {
    unsaved: {
      ta: { title: 'சேமிக்கப்படவில்லை!', description: 'மாற்றங்கள் சேமிக்கப்படவில்லை' },
      en: { title: 'Unsaved Changes!', description: 'Your changes have not been saved' }
    },
    confirm: {
      ta: { title: 'உறுதிப்படுத்தவும்!', description: 'இந்த செயலை தொடர விரும்புகிறீர்களா?' },
      en: { title: 'Please Confirm!', description: 'Do you want to continue with this action?' }
    }
  }
};

// Convenient functions for bilingual toasts
export const showBilingualToast = {
  success: (messageKey: keyof typeof toastMessages.success, language: 'ta' | 'en') => {
    const message = toastMessages.success[messageKey][language];
    return showToast.success(message.title, message.description);
  },

  error: (messageKey: keyof typeof toastMessages.error, language: 'ta' | 'en') => {
    const message = toastMessages.error[messageKey][language];
    return showToast.error(message.title, message.description);
  },

  warning: (messageKey: keyof typeof toastMessages.warning, language: 'ta' | 'en') => {
    const message = toastMessages.warning[messageKey][language];
    return showToast.warning(message.title, message.description);
  }
};

// Usage examples:
// showToast.success('Success!', 'Operation completed');
// showBilingualToast.success('saved', 'ta');
// showBilingualToast.error('network', 'en');