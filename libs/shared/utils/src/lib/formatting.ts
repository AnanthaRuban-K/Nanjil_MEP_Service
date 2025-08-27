export const formatDate = (date: string | Date, locale: 'ta' | 'en' = 'ta'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (locale === 'ta') {
    const tamilMonths = [
      'ஜனவரி', 'பிப்ரவரி', 'மார்ச்', 'ஏப்ரல்', 'மே', 'ஜூன்',
      'ஜூலை', 'ஆகஸ்ட்', 'செப்டம்பர்', 'அக்டோபர்', 'நவம்பர்', 'டிசம்பர்'
    ];
    const day = dateObj.getDate();
    const month = tamilMonths[dateObj.getMonth()];
    const year = dateObj.getFullYear();
    return `${day} ${month}, ${year}`;
  }
  
  return dateObj.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

export const formatTime = (time: string | Date, locale: 'ta' | 'en' = 'ta'): string => {
  const timeObj = typeof time === 'string' ? new Date(time) : time;
  
  const hours = timeObj.getHours();
  const minutes = timeObj.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  
  const timeString = `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  
  if (locale === 'ta') {
    const period = ampm === 'AM' ? 'காலை' : 'மாலை';
    return `${timeString} ${period}`;
  }
  
  return timeString;
};

export const formatCurrency = (amount: number, locale: 'ta' | 'en' = 'ta'): string => {
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
  
  if (locale === 'ta') {
    return `₹${amount.toLocaleString('en-IN')}`;
  }
  
  return formatted;
};

export const formatPhone = (phone: string): string => {
  // Format: +91 98765 12345
  if (phone.length === 10) {
    return `+91 ${phone.substring(0, 5)} ${phone.substring(5)}`;
  }
  return phone;
};