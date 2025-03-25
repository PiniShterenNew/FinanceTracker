import { useCallback } from 'react';
import { Budget } from '@/types';
import { useSyncedState } from '@/hooks/useSyncedState';
import { useTransactions } from '@/hooks/useTransactions';
import { startOfMonth, endOfMonth, isSameMonth, getDaysInMonth } from 'date-fns';

export const useBudgets = () => {
  const [budgets, setBudgets] = useSyncedState<Budget[]>('budgets', []);
  const { getMonthlyTransactionsByCategory } = useTransactions();
  
  // Add a new budget
  const addBudget = useCallback((budget: Budget) => {
    setBudgets(prev => [...prev, budget]);
  }, [setBudgets]);
  
  // Update an existing budget
  const updateBudget = useCallback((budgetId: string, updatedBudget: Partial<Budget>) => {
    setBudgets(prev => 
      prev.map(b => b.id === budgetId ? { ...b, ...updatedBudget } : b)
    );
  }, [setBudgets]);
  
  // Delete a budget
  const deleteBudget = useCallback((budgetId: string) => {
    setBudgets(prev => prev.filter(b => b.id !== budgetId));
  }, [setBudgets]);
  
  // Get all budgets for a specific month
  const getBudgets = useCallback((date: Date = new Date()) => {
    const month = startOfMonth(date);
    return budgets.filter(budget => 
      isSameMonth(new Date(budget.date), month)
    );
  }, [budgets]);
  
  // Get a budget by ID
  const getBudgetById = useCallback((budgetId: string) => {
    return budgets.find(b => b.id === budgetId);
  }, [budgets]);
  
  // Get status of a budget (spent, remaining, percentage)
  const getBudgetStatus = useCallback((budgetId: string) => {
    const budget = getBudgetById(budgetId);
    
    if (!budget) {
      return { spent: 0, remaining: 0, percentage: 0 };
    }
    
    const transactions = getMonthlyTransactionsByCategory(budget.categoryId, new Date(budget.date));
    const spent = transactions.reduce((total, t) => total + t.amount, 0);
    const remaining = Math.max(0, budget.amount - spent);
    const percentage = Math.min(100, Math.round((spent / budget.amount) * 100));
    
    return { spent, remaining, percentage };
  }, [getBudgetById, getMonthlyTransactionsByCategory]);
  
  // Get the remaining budget for the current month (all categories)
  const getRemainingBudget = useCallback(() => {
    const currentBudgets = getBudgets();
    let remaining = 0;
    
    currentBudgets.forEach(budget => {
      const { remaining: budgetRemaining } = getBudgetStatus(budget.id);
      remaining += budgetRemaining;
    });
    
    return remaining;
  }, [getBudgets, getBudgetStatus]);
  
  // Get the percentage of budget remaining
  const getBudgetPercentage = useCallback(() => {
    const currentBudgets = getBudgets();
    
    if (currentBudgets.length === 0) return 0;
    
    const totalBudget = currentBudgets.reduce((total, budget) => total + budget.amount, 0);
    const remainingBudget = getRemainingBudget();
    
    return Math.round((remainingBudget / totalBudget) * 100);
  }, [getBudgets, getRemainingBudget]);
  
  // Get the number of days remaining in the current month
  const getDaysRemaining = useCallback(() => {
    const today = new Date();
    const daysInMonth = getDaysInMonth(today);
    const currentDay = today.getDate();
    
    return daysInMonth - currentDay;
  }, []);
  
  return {
    budgets,
    addBudget,
    updateBudget,
    deleteBudget,
    getBudgets,
    getBudgetById,
    getBudgetStatus,
    getRemainingBudget,
    getBudgetPercentage,
    getDaysRemaining
  };
};
