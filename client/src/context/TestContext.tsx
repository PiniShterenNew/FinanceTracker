import React, { createContext, useContext, ReactNode } from "react";

// Create a simple context
const TestContext = createContext<{test: string} | undefined>(undefined);

// Provider component
export const TestProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const value = { test: "test value" };
  
  return (
    <TestContext.Provider value={value}>
      {children}
    </TestContext.Provider>
  );
};

// Hook to use the context
export const useTestContext = () => {
  const context = useContext(TestContext);
  
  if (context === undefined) {
    throw new Error("useTestContext must be used within a TestProvider");
  }
  
  return context;
};