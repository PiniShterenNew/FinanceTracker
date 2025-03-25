import React from 'react';
import { useI18n } from '@/components/ui/i18n-provider';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeView: string;
  setView: (view: string) => void;
  onOpenSettings: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onClose, 
  activeView, 
  setView,
  onOpenSettings
}) => {
  const { isHebrew, setLanguage } = useI18n();
  
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 transition-opacity" 
          onClick={onClose}
        ></div>
      )}
      
      {/* Sidebar */}
      <div 
        className={`
          fixed top-0 bottom-0 z-30 w-64 bg-white dark:bg-dark-navbar shadow-lg transform transition-transform ease-in-out duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          ${isHebrew ? 'right-0 rtl:-translate-x-full rtl:translate-x-0' : 'left-0'}
        `}
      >
        <div className="p-5">
          {/* Header */}
          <div className="flex items-center justify-between pb-5 border-b border-gray-200 dark:border-dark-border">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center">
                <span className="material-icons text-white text-sm">account_balance_wallet</span>
              </div>
              <h2 className="text-lg font-medium">{isHebrew ? 'הארנק שלי' : 'My Wallet'}</h2>
            </div>
            <button 
              onClick={onClose}
              className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-dark-card"
            >
              <span className="material-icons text-gray-500">close</span>
            </button>
          </div>
          
          {/* Navigation Menu */}
          <nav className="mt-5 space-y-1">
            <button 
              onClick={() => setView('dashboard')} 
              className={`
                group flex items-center px-2 py-2 w-full rounded-md
                ${activeView === 'dashboard' 
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-card'}
              `}
            >
              <span 
                className={`
                  material-icons mr-3 rtl:ml-3 rtl:mr-0
                  ${activeView === 'dashboard' 
                    ? 'text-primary-600 dark:text-primary-400' 
                    : 'text-gray-500 dark:text-gray-400'}
                `}
              >
                dashboard
              </span>
              <span>{isHebrew ? 'לוח מחוונים' : 'Dashboard'}</span>
            </button>
            
            <button 
              onClick={() => setView('transactions')} 
              className={`
                group flex items-center px-2 py-2 w-full rounded-md
                ${activeView === 'transactions' 
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-card'}
              `}
            >
              <span 
                className={`
                  material-icons mr-3 rtl:ml-3 rtl:mr-0
                  ${activeView === 'transactions' 
                    ? 'text-primary-600 dark:text-primary-400' 
                    : 'text-gray-500 dark:text-gray-400'}
                `}
              >
                receipt_long
              </span>
              <span>{isHebrew ? 'עסקאות' : 'Transactions'}</span>
            </button>
            
            <button 
              onClick={() => setView('budgets')} 
              className={`
                group flex items-center px-2 py-2 w-full rounded-md
                ${activeView === 'budgets' 
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-card'}
              `}
            >
              <span 
                className={`
                  material-icons mr-3 rtl:ml-3 rtl:mr-0
                  ${activeView === 'budgets' 
                    ? 'text-primary-600 dark:text-primary-400' 
                    : 'text-gray-500 dark:text-gray-400'}
                `}
              >
                pie_chart
              </span>
              <span>{isHebrew ? 'תקציבים' : 'Budgets'}</span>
            </button>
            
            <button 
              onClick={() => setView('reports')} 
              className={`
                group flex items-center px-2 py-2 w-full rounded-md
                ${activeView === 'reports' 
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-card'}
              `}
            >
              <span 
                className={`
                  material-icons mr-3 rtl:ml-3 rtl:mr-0
                  ${activeView === 'reports' 
                    ? 'text-primary-600 dark:text-primary-400' 
                    : 'text-gray-500 dark:text-gray-400'}
                `}
              >
                bar_chart
              </span>
              <span>{isHebrew ? 'דוחות' : 'Reports'}</span>
            </button>
            
            <div className="border-t border-gray-200 dark:border-dark-border pt-4 mt-4">
              <button 
                onClick={onOpenSettings}
                className="group flex items-center px-2 py-2 w-full rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-card"
              >
                <span className="material-icons mr-3 rtl:ml-3 rtl:mr-0 text-gray-500 dark:text-gray-400">
                  settings
                </span>
                <span>{isHebrew ? 'הגדרות' : 'Settings'}</span>
              </button>
              
              <div className="px-2 py-4 flex items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400 mr-3 rtl:ml-3 rtl:mr-0">
                  {isHebrew ? 'שפה:' : 'Language:'}
                </span>
                <button 
                  onClick={() => setLanguage('en')} 
                  className={`
                    px-2 py-1 text-sm rounded
                    ${!isHebrew 
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300' 
                      : 'text-gray-600 dark:text-gray-400'}
                  `}
                >
                  English
                </button>
                <button 
                  onClick={() => setLanguage('he')} 
                  className={`
                    px-2 py-1 text-sm rounded mx-1
                    ${isHebrew 
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300' 
                      : 'text-gray-600 dark:text-gray-400'}
                  `}
                >
                  עברית
                </button>
              </div>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
