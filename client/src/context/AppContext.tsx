import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { UserSettings, TransactionData, BudgetData } from "@shared/schema";
import { v4 as uuidv4 } from "uuid";
// Using direct import for testing
import { useLocalStorage } from "../hooks/useLocalStorage";
import { generateUniqueId } from "../lib/utils";

interface AppContextType {
  // User & Settings
  anonymousId: string;
  language: string;
  darkMode: boolean;
  currency: string;
  reminderEnabled: boolean;
  cloudSyncEnabled: boolean;
  setLanguage: (lang: string) => void;
  toggleDarkMode: () => void;
  setCurrency: (currency: string) => void;
  toggleReminderEnabled: () => void;
  toggleCloudSyncEnabled: () => void;
  
  // Data
  transactions: TransactionData[];
  budgets: BudgetData[];
  addTransaction: (transaction: TransactionData) => void;
  updateTransaction: (id: string, transaction: TransactionData) => void;
  deleteTransaction: (id: string) => void;
  addBudget: (budget: BudgetData) => void;
  updateBudget: (id: string, budget: BudgetData) => void;
  deleteBudget: (id: string) => void;
  
  // App State
  isOffline: boolean;
  isNewTransactionModalOpen: boolean;
  setIsNewTransactionModalOpen: (isOpen: boolean) => void;
  
  // Data Export/Import
  exportData: () => string;
  importData: (jsonData: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  // Generate or get anonymousId
  const [anonymousId, setAnonymousId] = useLocalStorage("anonymousId", "");
  
  useEffect(() => {
    if (!anonymousId) {
      setAnonymousId(uuidv4());
    }
  }, [anonymousId, setAnonymousId]);
  
  // User settings with defaults
  const [language, setLanguage] = useLocalStorage("language", "en");
  const [darkMode, setDarkMode] = useLocalStorage("darkMode", false);
  const [currency, setCurrency] = useLocalStorage("currency", "$");
  const [reminderEnabled, setReminderEnabled] = useLocalStorage("reminderEnabled", false);
  const [cloudSyncEnabled, setCloudSyncEnabled] = useLocalStorage("cloudSyncEnabled", false);
  
  // Data storage
  const [transactions, setTransactions] = useLocalStorage<TransactionData[]>("transactions", []);
  const [budgets, setBudgets] = useLocalStorage<BudgetData[]>("budgets", []);
  
  // App state
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isNewTransactionModalOpen, setIsNewTransactionModalOpen] = useState(false);
  
  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);
  
  // Data manipulation functions
  const addTransaction = (transaction: TransactionData) => {
    const newTransaction = {
      ...transaction,
      localId: generateUniqueId(),
      syncStatus: "pending",
    };
    setTransactions([newTransaction, ...transactions]);
  };
  
  const updateTransaction = (localId: string, transaction: TransactionData) => {
    setTransactions(
      transactions.map((t) => (t.localId === localId ? { ...t, ...transaction, syncStatus: "pending" } : t))
    );
  };
  
  const deleteTransaction = (localId: string) => {
    setTransactions(transactions.filter((t) => t.localId !== localId));
  };
  
  const addBudget = (budget: BudgetData) => {
    const newBudget = {
      ...budget,
      localId: generateUniqueId(),
    };
    setBudgets([...budgets, newBudget]);
  };
  
  const updateBudget = (localId: string, budget: BudgetData) => {
    setBudgets(budgets.map((b) => (b.localId === localId ? { ...b, ...budget } : b)));
  };
  
  const deleteBudget = (localId: string) => {
    setBudgets(budgets.filter((b) => b.localId !== localId));
  };
  
  // Theme toggle
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  
  // Feature toggles
  const toggleReminderEnabled = () => {
    setReminderEnabled(!reminderEnabled);
  };
  
  const toggleCloudSyncEnabled = () => {
    setCloudSyncEnabled(!cloudSyncEnabled);
  };
  
  // Data export/import
  const exportData = () => {
    const data = {
      transactions,
      budgets,
      settings: {
        language,
        darkMode,
        currency,
        reminderEnabled,
        cloudSyncEnabled
      }
    };
    return JSON.stringify(data);
  };
  
  const importData = (jsonData: string) => {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.transactions) {
        setTransactions(data.transactions);
      }
      
      if (data.budgets) {
        setBudgets(data.budgets);
      }
      
      if (data.settings) {
        const { language, darkMode, currency, reminderEnabled, cloudSyncEnabled } = data.settings;
        
        if (language) setLanguage(language);
        if (darkMode !== undefined) setDarkMode(darkMode);
        if (currency) setCurrency(currency);
        if (reminderEnabled !== undefined) setReminderEnabled(reminderEnabled);
        if (cloudSyncEnabled !== undefined) setCloudSyncEnabled(cloudSyncEnabled);
      }
    } catch (error) {
      console.error("Failed to import data:", error);
      throw new Error("Invalid data format");
    }
  };
  
  return (
    <AppContext.Provider
      value={{
        anonymousId,
        language,
        darkMode,
        currency,
        reminderEnabled,
        cloudSyncEnabled,
        setLanguage,
        toggleDarkMode,
        setCurrency,
        toggleReminderEnabled,
        toggleCloudSyncEnabled,
        
        transactions,
        budgets,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addBudget,
        updateBudget,
        deleteBudget,
        
        isOffline,
        isNewTransactionModalOpen,
        setIsNewTransactionModalOpen,
        
        exportData,
        importData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  
  return context;
};
