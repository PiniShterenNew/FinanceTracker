import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "./ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PWAInstallPrompt: React.FC = () => {
  const { t } = useTranslation();
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 76+ from automatically showing the prompt
      e.preventDefault();
      // Store the event for later use
      setInstallPrompt(e as BeforeInstallPromptEvent);
      
      // Check if we should show the prompt
      const hasPromptBeenShown = localStorage.getItem('pwaPromptShown');
      if (!hasPromptBeenShown) {
        setTimeout(() => {
          setShowPrompt(true);
        }, 3000);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);
  
  const handleInstallClick = () => {
    if (!installPrompt) return;
    
    // Show the installation prompt
    installPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    installPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      // Clear the saved prompt since it can't be used again
      setInstallPrompt(null);
      setShowPrompt(false);
      // Remember that we've shown the prompt
      localStorage.setItem('pwaPromptShown', 'true');
    });
  };
  
  const handleDismiss = () => {
    setShowPrompt(false);
    // Remember that we've shown the prompt, but don't set to "accepted"
    localStorage.setItem('pwaPromptShown', 'dismissed');
  };
  
  if (!showPrompt) return null;
  
  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-dark-gray shadow-lg rounded-t-lg p-4 mb-16 md:mb-0 ${
        showPrompt ? "transform translate-y-0" : "transform translate-y-full"
      } transition-transform duration-300 ease-in-out`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">{t("installApp")}</h3>
          <p className="text-sm text-neutral-700 dark:text-neutral-300">{t("installAppDescription")}</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleDismiss}>
            {t("notNow")}
          </Button>
          <Button onClick={handleInstallClick}>
            {t("install")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
