import React, { createContext, useContext, useState, ReactNode } from "react";

// Simple context type with minimal functionality
interface AppContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

// Create the context with a default value
const AppContext = createContext<AppContextType>({
  darkMode: false,
  toggleDarkMode: () => {},
});

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  // Simplified state
  const [darkMode, setDarkMode] = useState(false);
  
  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  
  // Create the context value
  const contextValue = {
    darkMode,
    toggleDarkMode,
  };
  
  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// Hook to use the app context
export const useAppContext = () => {
  return useContext(AppContext);
};
