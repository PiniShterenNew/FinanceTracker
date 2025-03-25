import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { initializeI18n, changeLanguage } from '@/lib/i18n';

type Language = 'en' | 'he';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
  isHebrew: boolean;
}

// Create a context with defaults
const I18nContext = createContext<I18nContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string) => key,
  dir: 'ltr',
  isHebrew: false,
});

export const useI18n = () => useContext(I18nContext);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageStorage] = useLocalStorage<Language>('language', 'en');
  
  // Initialize i18n
  useEffect(() => {
    initializeI18n();
  }, []);
  
  // Change language when language state changes
  useEffect(() => {
    changeLanguage(language);
    // Update HTML dir attribute for RTL support
    document.documentElement.dir = language === 'he' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);
  
  const setLanguage = (lang: Language) => {
    setLanguageStorage(lang);
  };
  
  // Simple translation function
  const t = (key: string): string => {
    return key; // This will be replaced with actual i18n implementation
  };
  
  const value = {
    language,
    setLanguage,
    t,
    dir: language === 'he' ? 'rtl' : 'ltr',
    isHebrew: language === 'he',
  };
  
  return (
    <I18nContext.Provider value={value}>
      <div className={language === 'he' ? 'rtl font-hebrew' : 'ltr font-sans'}>
        {children}
      </div>
    </I18nContext.Provider>
  );
};
