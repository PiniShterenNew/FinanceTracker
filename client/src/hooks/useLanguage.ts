import { useCallback } from 'react';
import { useI18n } from '@/components/ui/i18n-provider';

export const useLanguage = () => {
  const { language, setLanguage, isHebrew, t, dir } = useI18n();
  
  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'en' ? 'he' : 'en');
  }, [language, setLanguage]);
  
  return {
    language,
    setLanguage,
    toggleLanguage,
    isHebrew,
    t,
    dir
  };
};
