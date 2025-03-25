import { TransactionData, BudgetData, UserSettings } from "@shared/schema";

export interface Storage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

// Default to localStorage, but could be replaced with other storage engines
let storage: Storage = localStorage;

// Set a custom storage implementation (useful for testing or future cloud sync)
export const setStorage = (customStorage: Storage) => {
  storage = customStorage;
};

// Transactions
export const getTransactions = (): TransactionData[] => {
  try {
    const data = storage.getItem('transactions');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to get transactions:', error);
    return [];
  }
};

export const saveTransactions = (transactions: TransactionData[]) => {
  try {
    storage.setItem('transactions', JSON.stringify(transactions));
    return true;
  } catch (error) {
    console.error('Failed to save transactions:', error);
    return false;
  }
};

// Budgets
export const getBudgets = (): BudgetData[] => {
  try {
    const data = storage.getItem('budgets');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to get budgets:', error);
    return [];
  }
};

export const saveBudgets = (budgets: BudgetData[]) => {
  try {
    storage.setItem('budgets', JSON.stringify(budgets));
    return true;
  } catch (error) {
    console.error('Failed to save budgets:', error);
    return false;
  }
};

// Settings
export const getSettings = (): UserSettings => {
  try {
    const data = storage.getItem('settings');
    const defaultSettings: UserSettings = {
      language: 'en',
      darkMode: false,
      currency: '$',
      reminderEnabled: false,
      cloudSyncEnabled: false,
    };
    
    return data ? { ...defaultSettings, ...JSON.parse(data) } : defaultSettings;
  } catch (error) {
    console.error('Failed to get settings:', error);
    return {
      language: 'en',
      darkMode: false,
      currency: '$',
      reminderEnabled: false,
      cloudSyncEnabled: false,
    };
  }
};

export const saveSettings = (settings: UserSettings) => {
  try {
    storage.setItem('settings', JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('Failed to save settings:', error);
    return false;
  }
};

// Sync status
export const getPendingSyncItems = (): Record<string, any>[] => {
  try {
    const data = storage.getItem('pendingSync');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to get pending sync items:', error);
    return [];
  }
};

export const savePendingSyncItems = (items: Record<string, any>[]) => {
  try {
    storage.setItem('pendingSync', JSON.stringify(items));
    return true;
  } catch (error) {
    console.error('Failed to save pending sync items:', error);
    return false;
  }
};

// Clear all data (for reset)
export const clearAllData = () => {
  try {
    storage.removeItem('transactions');
    storage.removeItem('budgets');
    storage.removeItem('settings');
    storage.removeItem('pendingSync');
    return true;
  } catch (error) {
    console.error('Failed to clear all data:', error);
    return false;
  }
};

// Check if storage is available
export const isStorageAvailable = () => {
  try {
    const test = 'test';
    storage.setItem(test, test);
    storage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
};
