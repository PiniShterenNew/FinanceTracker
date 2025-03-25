import React, { useState } from 'react';
import { useI18n } from '@/components/ui/i18n-provider';
import { useTheme } from '@/components/ui/theme-provider';
import { exportData, importData } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import { useSyncedState } from '@/hooks/useSyncedState';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Currency = 'USD' | 'EUR' | 'GBP' | 'ILS';

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { isHebrew, setLanguage } = useI18n();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  
  const [currency, setCurrency] = useSyncedState<Currency>('currency', 'USD');
  const [cloudSync, setCloudSync] = useSyncedState('cloud-sync', false);
  const [encryptData, setEncryptData] = useSyncedState('encrypt-data', false);
  
  const handleExportData = () => {
    exportData()
      .then(() => {
        toast({
          title: isHebrew ? 'ייצוא הצליח' : 'Export Successful',
          description: isHebrew ? 'הנתונים יוצאו בהצלחה' : 'Your data has been exported successfully',
        });
      })
      .catch((error) => {
        toast({
          title: isHebrew ? 'ייצוא נכשל' : 'Export Failed',
          description: error.message,
          variant: 'destructive',
        });
      });
  };
  
  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        importData(file)
          .then(() => {
            toast({
              title: isHebrew ? 'ייבוא הצליח' : 'Import Successful',
              description: isHebrew ? 'הנתונים יובאו בהצלחה' : 'Your data has been imported successfully',
            });
            onClose();
          })
          .catch((error) => {
            toast({
              title: isHebrew ? 'ייבוא נכשל' : 'Import Failed',
              description: error.message,
              variant: 'destructive',
            });
          });
      }
    };
    input.click();
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        
        <div className="inline-block align-bottom bg-white dark:bg-dark-card rounded-t-xl sm:rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">{isHebrew ? 'הגדרות' : 'Settings'}</h3>
              <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-dark-border">
                <span className="material-icons text-gray-500">close</span>
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Language */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{isHebrew ? 'שפה' : 'Language'}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {isHebrew ? 'שנה את שפת האפליקציה' : 'Change application language'}
                  </p>
                </div>
                <div className="flex space-x-2 rtl:space-x-reverse">
                  <button 
                    onClick={() => setLanguage('en')} 
                    className={`
                      px-3 py-1 rounded-full text-sm
                      ${!isHebrew 
                        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300' 
                        : 'bg-gray-100 dark:bg-dark-background text-gray-700 dark:text-gray-300'}
                    `}
                  >
                    English
                  </button>
                  <button 
                    onClick={() => setLanguage('he')} 
                    className={`
                      px-3 py-1 rounded-full text-sm
                      ${isHebrew 
                        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300' 
                        : 'bg-gray-100 dark:bg-dark-background text-gray-700 dark:text-gray-300'}
                    `}
                  >
                    עברית
                  </button>
                </div>
              </div>
              
              {/* Theme */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{isHebrew ? 'ערכת נושא' : 'Theme'}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {isHebrew ? 'שנה בין מצב בהיר לכהה' : 'Switch between light and dark mode'}
                  </p>
                </div>
                <div className="flex space-x-2 rtl:space-x-reverse">
                  <button 
                    onClick={() => setTheme('light')} 
                    className={`
                      px-3 py-1 rounded-full text-sm
                      ${theme === 'light' 
                        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300' 
                        : 'bg-gray-100 dark:bg-dark-background text-gray-700 dark:text-gray-300'}
                    `}
                  >
                    {isHebrew ? 'בהיר' : 'Light'}
                  </button>
                  <button 
                    onClick={() => setTheme('dark')} 
                    className={`
                      px-3 py-1 rounded-full text-sm
                      ${theme === 'dark' 
                        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300' 
                        : 'bg-gray-100 dark:bg-dark-background text-gray-700 dark:text-gray-300'}
                    `}
                  >
                    {isHebrew ? 'כהה' : 'Dark'}
                  </button>
                </div>
              </div>
              
              {/* Currency */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{isHebrew ? 'מטבע' : 'Currency'}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {isHebrew ? 'שנה את המטבע הראשי' : 'Change your primary currency'}
                  </p>
                </div>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as Currency)}
                  className="appearance-none px-3 py-1 rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-background focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent text-sm"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="ILS">ILS (₪)</option>
                </select>
              </div>
              
              {/* Data & Sync */}
              <div className="border-t border-gray-200 dark:border-dark-border pt-4">
                <h4 className="font-medium mb-2">{isHebrew ? 'נתונים וסנכרון' : 'Data & Sync'}</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{isHebrew ? 'סנכרון ענן' : 'Cloud Sync'}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {isHebrew ? 'סנכרן נתונים בין מכשירים' : 'Sync data across devices'}
                      </p>
                    </div>
                    <div className="relative inline-block">
                      <input
                        type="checkbox"
                        id="cloudSync"
                        checked={cloudSync}
                        onChange={() => setCloudSync(!cloudSync)}
                        className="sr-only"
                      />
                      <label
                        htmlFor="cloudSync"
                        className={`block w-10 h-6 rounded-full transition-colors duration-200 ease-in-out ${
                          cloudSync ? 'bg-primary-500' : 'bg-gray-200 dark:bg-dark-border'
                        }`}
                      >
                        <span
                          className={`absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out ${
                            cloudSync ? 'transform translate-x-4' : ''
                          }`}
                        />
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{isHebrew ? 'הצפנת נתונים' : 'Encrypt Data'}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {isHebrew ? 'הגן על נתונים באמצעות הצפנה' : 'Protect data with encryption'}
                      </p>
                    </div>
                    <div className="relative inline-block">
                      <input
                        type="checkbox"
                        id="encryption"
                        checked={encryptData}
                        onChange={() => setEncryptData(!encryptData)}
                        className="sr-only"
                      />
                      <label
                        htmlFor="encryption"
                        className={`block w-10 h-6 rounded-full transition-colors duration-200 ease-in-out ${
                          encryptData ? 'bg-primary-500' : 'bg-gray-200 dark:bg-dark-border'
                        }`}
                      >
                        <span
                          className={`absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out ${
                            encryptData ? 'transform translate-x-4' : ''
                          }`}
                        />
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <button 
                      onClick={handleExportData}
                      className="text-sm text-primary-500 font-medium"
                    >
                      {isHebrew ? 'ייצא נתונים' : 'Export Data'}
                    </button>
                    <button 
                      onClick={handleImportData}
                      className="text-sm text-primary-500 font-medium"
                    >
                      {isHebrew ? 'ייבא נתונים' : 'Import Data'}
                    </button>
                  </div>
                </div>
              </div>
              
              {/* About & Support */}
              <div className="border-t border-gray-200 dark:border-dark-border pt-4">
                <h4 className="font-medium mb-2">{isHebrew ? 'אודות ותמיכה' : 'About & Support'}</h4>
                <div className="space-y-2">
                  <button className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                    <span className="material-icons mr-2 rtl:ml-2 rtl:mr-0 text-gray-500">help_outline</span>
                    <span>{isHebrew ? 'מדריך משתמש' : 'User Guide'}</span>
                  </button>
                  <button className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                    <span className="material-icons mr-2 rtl:ml-2 rtl:mr-0 text-gray-500">privacy_tip</span>
                    <span>{isHebrew ? 'מדיניות פרטיות' : 'Privacy Policy'}</span>
                  </button>
                  <button className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                    <span className="material-icons mr-2 rtl:ml-2 rtl:mr-0 text-gray-500">info</span>
                    <span>{isHebrew ? 'אודות האפליקציה' : 'About App'}</span>
                  </button>
                  <div className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
                    <span>My Wallet v1.0.0</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
