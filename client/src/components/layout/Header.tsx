import React from 'react';
import { useTheme } from '@/components/ui/theme-provider';
import { useI18n } from '@/components/ui/i18n-provider';

interface HeaderProps {
  onMenuToggle: () => void;
  onAddTransaction: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle, onAddTransaction }) => {
  const { toggleTheme, theme } = useTheme();
  const { isHebrew } = useI18n();
  
  return (
    <header className="bg-white dark:bg-dark-navbar shadow-sm">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <button 
            onClick={onMenuToggle} 
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-dark-card"
          >
            <span className="material-icons text-gray-700 dark:text-gray-300">menu</span>
          </button>
          <h1 className="text-xl font-semibold text-primary-600 dark:text-primary-400">
            {isHebrew ? 'הארנק שלי' : 'My Wallet'}
          </h1>
        </div>
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <button 
            onClick={onAddTransaction} 
            className="rounded-full bg-primary-500 text-white p-2 shadow-md hover:bg-primary-600 transition-all"
          >
            <span className="material-icons">add</span>
          </button>
          <button 
            onClick={toggleTheme} 
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-dark-card"
          >
            <span className="material-icons">
              {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
