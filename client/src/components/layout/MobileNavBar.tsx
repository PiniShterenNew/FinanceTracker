import React from 'react';
import { useI18n } from '@/components/ui/i18n-provider';

interface MobileNavBarProps {
  activeView: string;
  setView: (view: string) => void;
  onAddTransaction: () => void;
}

const MobileNavBar: React.FC<MobileNavBarProps> = ({ 
  activeView, 
  setView, 
  onAddTransaction 
}) => {
  const { isHebrew } = useI18n();
  
  return (
    <nav className="block md:hidden bg-white dark:bg-dark-navbar shadow-lg border-t border-gray-200 dark:border-dark-border">
      <div className="flex justify-around">
        <button 
          onClick={() => setView('dashboard')} 
          className={`
            flex flex-col items-center py-2 flex-1
            ${activeView === 'dashboard' ? 'text-primary-500' : 'text-gray-500 dark:text-gray-400'}
          `}
        >
          <span className="material-icons text-current">dashboard</span>
          <span className="text-xs mt-1">{isHebrew ? 'לוח מחוונים' : 'Dashboard'}</span>
        </button>
        
        <button 
          onClick={() => setView('transactions')} 
          className={`
            flex flex-col items-center py-2 flex-1
            ${activeView === 'transactions' ? 'text-primary-500' : 'text-gray-500 dark:text-gray-400'}
          `}
        >
          <span className="material-icons text-current">receipt_long</span>
          <span className="text-xs mt-1">{isHebrew ? 'עסקאות' : 'Transactions'}</span>
        </button>
        
        <button 
          onClick={onAddTransaction} 
          className="flex flex-col items-center -mt-5 flex-1"
        >
          <div className="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center text-white shadow-lg">
            <span className="material-icons">add</span>
          </div>
          <span className="text-xs mt-1 text-primary-500">{isHebrew ? 'הוסף' : 'Add'}</span>
        </button>
        
        <button 
          onClick={() => setView('budgets')} 
          className={`
            flex flex-col items-center py-2 flex-1
            ${activeView === 'budgets' ? 'text-primary-500' : 'text-gray-500 dark:text-gray-400'}
          `}
        >
          <span className="material-icons text-current">pie_chart</span>
          <span className="text-xs mt-1">{isHebrew ? 'תקציבים' : 'Budgets'}</span>
        </button>
        
        <button 
          onClick={() => setView('reports')} 
          className={`
            flex flex-col items-center py-2 flex-1
            ${activeView === 'reports' ? 'text-primary-500' : 'text-gray-500 dark:text-gray-400'}
          `}
        >
          <span className="material-icons text-current">bar_chart</span>
          <span className="text-xs mt-1">{isHebrew ? 'דוחות' : 'Reports'}</span>
        </button>
      </div>
    </nav>
  );
};

export default MobileNavBar;
