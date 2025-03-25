import { useState, useCallback } from 'react';
import { Transaction, CategorySpending, TransactionType } from '@/types';
import { useSyncedState } from '@/hooks/useSyncedState';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval, subMonths, isSameDay, isSameMonth } from 'date-fns';

export const useTransactions = () => {
  const [transactions, setTransactions] = useSyncedState<Transaction[]>('transactions', []);
  
  // Add a new transaction
  const addTransaction = useCallback((transaction: Transaction) => {
    setTransactions(prev => [transaction, ...prev]);
  }, [setTransactions]);
  
  // Update an existing transaction
  const updateTransaction = useCallback((transactionId: string, updatedTransaction: Partial<Transaction>) => {
    setTransactions(prev => 
      prev.map(t => t.id === transactionId ? { ...t, ...updatedTransaction } : t)
    );
  }, [setTransactions]);
  
  // Delete a transaction
  const deleteTransaction = useCallback((transactionId: string) => {
    setTransactions(prev => prev.filter(t => t.id !== transactionId));
  }, [setTransactions]);
  
  // Get all transactions
  const getAllTransactions = useCallback(() => {
    return [...transactions].sort((a, b) => b.timestamp - a.timestamp);
  }, [transactions]);
  
  // Get recent transactions
  const getRecentTransactions = useCallback((limit = 5) => {
    return [...transactions]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }, [transactions]);
  
  // Group transactions by date (for transaction list view)
  const getTransactionsByDate = useCallback((transactionsToGroup = transactions) => {
    const groupedTransactions: Record<string, Transaction[]> = {};
    
    [...transactionsToGroup]
      .sort((a, b) => b.timestamp - a.timestamp)
      .forEach(transaction => {
        const date = format(new Date(transaction.timestamp), 'yyyy-MM-dd');
        if (!groupedTransactions[date]) {
          groupedTransactions[date] = [];
        }
        groupedTransactions[date].push(transaction);
      });
    
    return groupedTransactions;
  }, [transactions]);
  
  // Calculate total balance
  const getTotalBalance = useCallback(() => {
    return transactions.reduce((total, transaction) => {
      if (transaction.type === 'income') {
        return total + transaction.amount;
      } else {
        return total - transaction.amount;
      }
    }, 0);
  }, [transactions]);
  
  // Calculate monthly change percentage
  const getMonthlyChange = useCallback(() => {
    const now = new Date();
    const currentMonth = startOfMonth(now);
    const lastMonth = startOfMonth(subMonths(now, 1));
    
    const currentMonthTransactions = transactions.filter(t => 
      isSameMonth(new Date(t.timestamp), currentMonth)
    );
    const lastMonthTransactions = transactions.filter(t => 
      isSameMonth(new Date(t.timestamp), lastMonth)
    );
    
    const currentMonthBalance = currentMonthTransactions.reduce((total, t) => 
      t.type === 'income' ? total + t.amount : total - t.amount, 0);
    const lastMonthBalance = lastMonthTransactions.reduce((total, t) => 
      t.type === 'income' ? total + t.amount : total - t.amount, 0);
    
    if (lastMonthBalance === 0) return 0;
    return ((currentMonthBalance - lastMonthBalance) / Math.abs(lastMonthBalance)) * 100;
  }, [transactions]);
  
  // Get spending by category
  const getCategorySpending = useCallback(() => {
    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    const total = expenseTransactions.reduce((acc, t) => acc + t.amount, 0);
    
    const categoryMap: Record<string, number> = {};
    
    expenseTransactions.forEach(t => {
      if (!categoryMap[t.category]) {
        categoryMap[t.category] = 0;
      }
      categoryMap[t.category] += t.amount;
    });
    
    const result: CategorySpending[] = Object.entries(categoryMap).map(([categoryId, amount]) => ({
      categoryId,
      amount,
      total
    }));
    
    return result.sort((a, b) => b.amount - a.amount);
  }, [transactions]);
  
  // Get data for monthly overview chart
  const getMonthlyChartData = useCallback(() => {
    const now = new Date();
    const sixMonthsAgo = subMonths(now, 6);
    const dates = eachMonthOfInterval({ start: sixMonthsAgo, end: now });
    
    const labels = dates.map(date => format(date, 'MMM d'));
    const incomeData = new Array(dates.length).fill(0);
    const expenseData = new Array(dates.length).fill(0);
    
    transactions.forEach(transaction => {
      const transactionDate = new Date(transaction.timestamp);
      const monthIndex = dates.findIndex(date => 
        isSameMonth(date, transactionDate)
      );
      
      if (monthIndex !== -1) {
        if (transaction.type === 'income') {
          incomeData[monthIndex] += transaction.amount;
        } else {
          expenseData[monthIndex] += transaction.amount;
        }
      }
    });
    
    // Make income and expense cumulative
    for (let i = 1; i < dates.length; i++) {
      incomeData[i] += incomeData[i - 1];
      expenseData[i] += expenseData[i - 1];
    }
    
    return { labels, incomeData, expenseData };
  }, [transactions]);
  
  // Get data for cash flow chart based on timeframe
  const getCashFlowData = useCallback((timeFrame: 'monthly' | 'weekly' | 'daily') => {
    const now = new Date();
    let dates: Date[];
    let format_str: string;
    
    switch (timeFrame) {
      case 'monthly':
        dates = eachMonthOfInterval({ 
          start: subMonths(now, 5), 
          end: now 
        });
        format_str = 'MMM';
        break;
      case 'weekly':
        dates = eachWeekOfInterval({
          start: subMonths(now, 2),
          end: now
        }, { weekStartsOn: 1 });
        format_str = 'MMM d';
        break;
      case 'daily':
        dates = eachDayOfInterval({
          start: subMonths(now, 0.5),
          end: now
        });
        format_str = 'd MMM';
        break;
    }
    
    const labels = dates.map(date => format(date, format_str));
    const incomeData = new Array(dates.length).fill(0);
    const expenseData = new Array(dates.length).fill(0);
    
    transactions.forEach(transaction => {
      const txDate = new Date(transaction.timestamp);
      let dateIndex: number;
      
      switch (timeFrame) {
        case 'monthly':
          dateIndex = dates.findIndex(date => isSameMonth(date, txDate));
          break;
        case 'weekly':
          dateIndex = dates.findIndex(date => 
            txDate >= date && txDate < new Date(date.getTime() + 7 * 24 * 60 * 60 * 1000)
          );
          break;
        case 'daily':
          dateIndex = dates.findIndex(date => isSameDay(date, txDate));
          break;
      }
      
      if (dateIndex !== -1) {
        if (transaction.type === 'income') {
          incomeData[dateIndex] += transaction.amount;
        } else {
          expenseData[dateIndex] += transaction.amount;
        }
      }
    });
    
    return { labels, incomeData, expenseData };
  }, [transactions]);
  
  // Get monthly transactions for a specific category
  const getMonthlyTransactionsByCategory = useCallback((categoryId: string, date: Date) => {
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    
    return transactions.filter(transaction => 
      transaction.category === categoryId &&
      new Date(transaction.timestamp) >= monthStart &&
      new Date(transaction.timestamp) <= monthEnd
    );
  }, [transactions]);
  
  return {
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getAllTransactions,
    getRecentTransactions,
    getTransactionsByDate,
    getTotalBalance,
    getMonthlyChange,
    getCategorySpending,
    getMonthlyChartData,
    getCashFlowData,
    getMonthlyTransactionsByCategory
  };
};
