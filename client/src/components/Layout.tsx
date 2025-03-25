import React, { ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "wouter";
import { useAppContext } from "@/context/AppContext";
import { Button } from "./ui/button";
import PWAInstallPrompt from "./PWAInstallPrompt";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { t } = useTranslation();
  const [location] = useLocation();
  const { 
    darkMode, 
    toggleDarkMode,
    language,
    setLanguage,
    isNewTransactionModalOpen,
    setIsNewTransactionModalOpen 
  } = useAppContext();
  
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  // Navigation items
  const navItems = [
    { id: "/", icon: "dashboard", label: t("dashboard") },
    { id: "/transactions", icon: "receipt_long", label: t("transactions") },
    { id: "/budgets", icon: "account_balance", label: t("budgets") },
    { id: "/reports", icon: "bar_chart", label: t("reports") },
    { id: "/settings", icon: "settings", label: t("settings") },
  ];
  
  return (
    <div className="h-screen flex flex-col md:flex-row overflow-hidden">
      {/* Sidebar Navigation - Only visible on tablet and above */}
      <aside className="hidden md:flex md:w-64 lg:w-72 flex-shrink-0 flex-col bg-white dark:bg-dark-gray shadow-md transition-all">
        <div className="p-4 flex items-center space-x-3 border-b border-neutral-200 dark:border-neutral-700">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-white">
            <span className="material-icons">account_balance_wallet</span>
          </div>
          <h1 className="text-xl font-semibold">My Wallet</h1>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4">
          <ul>
            {navItems.map((item) => (
              <li key={item.id}>
                <Link href={item.id}>
                  <div 
                    className={`flex items-center space-x-3 px-4 py-3 cursor-pointer ${
                      location === item.id 
                        ? "text-primary bg-blue-50 dark:bg-blue-900/20 border-r-4 border-primary" 
                        : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-dark-navy"
                    }`}
                  >
                    <span className="material-icons">{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-neutral-700 dark:text-neutral-300">{t("darkMode")}</span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-neutral-300 dark:bg-primary" 
              onClick={toggleDarkMode}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                darkMode ? "translate-x-6" : "translate-x-1"
              }`}></span>
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-700 dark:text-neutral-300">{t("language")}</span>
            <select 
              className="text-sm bg-transparent border border-neutral-300 dark:border-neutral-700 rounded px-2 py-1"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="en">English</option>
              <option value="he">עברית</option>
            </select>
          </div>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header - Only visible on mobile */}
        <header className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-dark-gray shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
              <span className="material-icons text-sm">account_balance_wallet</span>
            </div>
            <h1 className="text-lg font-semibold">My Wallet</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setLanguage(language === "en" ? "he" : "en")}
            >
              <span className="material-icons">translate</span>
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleDarkMode}
            >
              <span className="material-icons dark:hidden">dark_mode</span>
              <span className="material-icons hidden dark:inline">light_mode</span>
            </Button>
          </div>
        </header>
        
        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 pb-20 md:pb-4">
          {children}
        </div>
        
        {/* Mobile Navigation - Only visible on mobile */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-dark-gray border-t border-neutral-200 dark:border-neutral-700 z-10">
          <ul className="flex items-center justify-around">
            {navItems.slice(0, 2).map((item) => (
              <li key={item.id}>
                <Link href={item.id}>
                  <div className={`flex flex-col items-center p-3 cursor-pointer ${
                    location === item.id ? "text-primary" : "text-neutral-500 dark:text-neutral-400"
                  }`}>
                    <span className="material-icons">{item.icon}</span>
                    <span className="text-xs mt-1">{item.label}</span>
                  </div>
                </Link>
              </li>
            ))}
            
            {/* Add Transaction Button */}
            <li>
              <div 
                className="cursor-pointer flex flex-col items-center p-3"
                onClick={() => setIsNewTransactionModalOpen(true)}
              >
                <div 
                  className="w-12 h-12 rounded-full bg-primary -mt-6 flex items-center justify-center text-white shadow-lg"
                >
                  <span className="material-icons">add</span>
                </div>
              </div>
            </li>
            
            {navItems.slice(2, 4).map((item) => (
              <li key={item.id}>
                <Link href={item.id}>
                  <div className={`flex flex-col items-center p-3 cursor-pointer ${
                    location === item.id ? "text-primary" : "text-neutral-500 dark:text-neutral-400"
                  }`}>
                    <span className="material-icons">{item.icon}</span>
                    <span className="text-xs mt-1">{item.label}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </main>
      
      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </div>
  );
};

export default Layout;
