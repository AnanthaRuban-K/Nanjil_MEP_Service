import * as React from 'react';
import { cn } from '../utils';
import { Card } from './card';

interface ServiceCardProps extends React.HTMLAttributes<HTMLDivElement> {
  type: 'electrical' | 'plumbing' | 'emergency';
  title: { ta: string; en: string };
  description: { ta: string; en: string };
  icon: React.ReactNode;
  language: 'ta' | 'en';
  selected?: boolean;
}

const ServiceCard = React.forwardRef<HTMLDivElement, ServiceCardProps>(
  ({ className, type, title, description, icon, language, selected = false, ...props }, ref) => {
    const baseClasses = cn(
      'service-card text-center p-8 cursor-pointer transition-all duration-300',
      selected && 'ring-4 ring-primary-500 border-primary-500 bg-primary-50',
      type === 'electrical' && !selected && 'hover:border-electrical-500 hover:bg-electrical-50',
      type === 'plumbing' && !selected && 'hover:border-plumbing-500 hover:bg-plumbing-50',
      type === 'emergency' && !selected && 'hover:border-emergency-500 hover:bg-emergency-50',
      className
    );

    return (
      <Card
        ref={ref}
        className={baseClasses}
        {...props}
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="icon-service text-gray-600">
            {icon}
          </div>
          
          <div className="text-bilingual">
            <h3 className={cn(
              'text-2xl font-black mb-1',
              language === 'ta' ? 'font-tamil' : 'font-english'
            )}>
              {title[language]}
            </h3>
            <p className={cn(
              'text-lg text-gray-600',
              language === 'ta' ? 'font-tamil' : 'font-english'
            )}>
              {description[language]}
            </p>
          </div>
          
          {type === 'emergency' && (
            <div className="bg-red-100 text-red-800 px-4 py-2 rounded-full text-sm font-bold animate-pulse">
              24 {language === 'ta' ? 'மணி நேரம்' : 'Hours'}
            </div>
          )}
        </div>
      </Card>
    );
  }
);
ServiceCard.displayName = 'ServiceCard';

export { ServiceCard };