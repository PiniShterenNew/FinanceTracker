import React from 'react';
import { format } from 'date-fns';
import { useI18n } from '@/components/ui/i18n-provider';

interface MonthSelectorProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

const MonthSelector: React.FC<MonthSelectorProps> = ({ 
  currentDate, 
  onPrevMonth, 
  onNextMonth 
}) => {
  const { isHebrew } = useI18n();
  
  // Format the date according to the current language
  const formattedDate = format(currentDate, 'MMMM yyyy');
  
  return (
    <div className="flex items-center justify-between mb-4">
      <button 
        onClick={onPrevMonth}
        className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-dark-card"
      >
        <span className="material-icons text-gray-500">
          {isHebrew ? 'chevron_right' : 'chevron_left'}
        </span>
      </button>
      <h2 className="text-lg font-semibold">{formattedDate}</h2>
      <button 
        onClick={onNextMonth}
        className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-dark-card"
      >
        <span className="material-icons text-gray-500">
          {isHebrew ? 'chevron_left' : 'chevron_right'}
        </span>
      </button>
    </div>
  );
};

export default MonthSelector;
