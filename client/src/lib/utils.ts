import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { TransactionData, BudgetData, CATEGORIES } from "@shared/schema";
import { format, isToday, isYesterday, isThisWeek, isThisMonth, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval } from "date-fns";
import { v4 as uuidv4 } from "uuid";

// Utility for merging class names
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Generate a unique ID for local entities
export function generateUniqueId(): string {
  return uuidv4();
}

// Format currency amount
export function formatCurrency(amount: number, currency: string = "$"): string {
  return `${currency}${Math.abs(amount).toFixed(2)}`;
}

// Format date in readable format
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  
  if (isToday(date)) {
    return `Today, ${format(date, "p")}`;
  }
  
  if (isYesterday(date)) {
    return `Yesterday, ${format(date, "p")}`;
  }
  
  if (isThisWeek(date)) {
    return format(date, "EEEE, p");
  }
  
  if (isThisMonth(date)) {
    return format(date, "d MMMM, p");
  }
  
  return format(date, "d MMM yyyy, p");
}

// Group transactions by date
export function groupTransactionsByDate(transactions: TransactionData[]): Record<string, TransactionData[]> {
  const grouped: Record<string, TransactionData[]> = {};
  
  transactions.forEach(transaction => {
    const dateKey = format(new Date(transaction.date), "yyyy-MM-dd");
    
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    
    grouped[dateKey].push(transaction);
  });
  
  return grouped;
}

// Get monthly stats (income, expenses, remaining, savings)
export function getMonthlyStats(transactions: TransactionData[]) {
  // Filter for current month
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  const monthTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate >= firstDayOfMonth && transactionDate <= lastDayOfMonth;
  });
  
  // Calculate income (positive amounts)
  const income = monthTransactions
    .filter(t => t.amount > 0)
    .reduce((total, t) => total + t.amount, 0);
  
  // Calculate expenses (negative amounts)
  const expenses = monthTransactions
    .filter(t => t.amount < 0)
    .reduce((total, t) => total + Math.abs(t.amount), 0);
  
  // Calculate remaining (income - expenses)
  const remaining = income - expenses;
  
  // Calculate savings (assume this is a special category)
  const savings = monthTransactions
    .filter(t => t.category === "savings" && t.type === "expense")
    .reduce((total, t) => total + Math.abs(t.amount), 0);
  
  return { income, expenses, remaining, savings };
}

// Get budget progress for a specific category
export function getBudgetProgress(budget: BudgetData, transactions: TransactionData[]) {
  const startDate = new Date(budget.startDate);
  const endDate = new Date(budget.endDate);
  
  // Filter transactions by date range and category
  const budgetTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return (
      t.category === budget.category &&
      t.amount < 0 && // Only expenses
      transactionDate >= startDate &&
      transactionDate <= endDate
    );
  });
  
  // Calculate total spent
  const spent = budgetTransactions.reduce((total, t) => total + Math.abs(t.amount), 0);
  
  // Calculate percentage
  const percentage = Math.min(Math.round((spent / budget.amount) * 100), 100);
  
  return { spent, percentage };
}

// Get recent transactions
export function getRecentTransactions(transactions: TransactionData[], limit: number = 5): TransactionData[] {
  return [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}

// Get categories with spending data for charts
export function getCategoriesWithSpending(transactions: TransactionData[]) {
  // Filter expenses only
  const expenses = transactions.filter(t => t.amount < 0);
  
  // Calculate total expenses
  const totalExpenses = expenses.reduce((sum, t) => sum + Math.abs(t.amount), 0);
  
  // Map of category colors
  const categoryColors = {
    food: "#3B82F6", // blue
    shopping: "#8B5CF6", // purple
    transport: "#F59E0B", // amber
    entertainment: "#10B981", // green
    utilities: "#6B7280", // gray
    health: "#EF4444", // red
    housing: "#F97316", // orange
    education: "#6366F1", // indigo
    personal: "#EC4899", // pink
    travel: "#0EA5E9", // sky
    income: "#10B981", // green (but shouldn't appear in expenses)
    savings: "#8B5CF6", // purple
    other: "#6B7280", // gray
  };
  
  // Group by category
  const categoryData: Record<string, { amount: number, count: number }> = {};
  
  expenses.forEach(transaction => {
    if (!categoryData[transaction.category]) {
      categoryData[transaction.category] = { amount: 0, count: 0 };
    }
    
    categoryData[transaction.category].amount += Math.abs(transaction.amount);
    categoryData[transaction.category].count += 1;
  });
  
  // Convert to array with percentages
  const result = Object.entries(categoryData).map(([categoryId, data]) => {
    const category = CATEGORIES.find(c => c.id === categoryId);
    const percentage = totalExpenses ? Math.round((data.amount / totalExpenses) * 100) : 0;
    
    return {
      id: categoryId,
      name: category?.name || categoryId,
      icon: category?.icon || "category",
      amount: data.amount,
      count: data.count,
      percentage,
      color: categoryColors[categoryId as keyof typeof categoryColors] || "#6B7280"
    };
  });
  
  // Sort by amount
  return result.sort((a, b) => b.amount - a.amount);
}

// Get monthly expenses by category for trend charts
export function getMonthlyExpensesByCategory(
  transactions: TransactionData[],
  startDate: Date,
  endDate: Date,
  monthsCount: number = 6
) {
  // Generate array of months
  const months = eachMonthOfInterval({ start: startDate, end: endDate });
  
  // Limit to requested count
  const limitedMonths = months.slice(-monthsCount);
  
  // Initialize result
  const result = limitedMonths.map(month => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    
    // Filter transactions for this month
    const monthTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= monthStart && transactionDate <= monthEnd && t.amount < 0;
    });
    
    // Group by category
    const categoryTotals: Record<string, number> = {};
    
    monthTransactions.forEach(transaction => {
      if (!categoryTotals[transaction.category]) {
        categoryTotals[transaction.category] = 0;
      }
      
      categoryTotals[transaction.category] += Math.abs(transaction.amount);
    });
    
    return {
      name: format(month, "MMM"),
      date: month,
      ...categoryTotals
    };
  });
  
  return result;
}

// Get income vs expenses over time for trend charts
export function getIncomesExpensesOverTime(
  transactions: TransactionData[],
  startDate: Date,
  endDate: Date,
  monthsCount: number = 6
) {
  // Generate array of months
  const months = eachMonthOfInterval({ start: startDate, end: endDate });
  
  // Limit to requested count
  const limitedMonths = months.slice(-monthsCount);
  
  // Initialize result
  const result = limitedMonths.map(month => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    
    // Filter transactions for this month
    const monthTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= monthStart && transactionDate <= monthEnd;
    });
    
    // Calculate income and expenses
    const income = monthTransactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = monthTransactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    return {
      name: format(month, "MMM"),
      date: month,
      income,
      expenses
    };
  });
  
  return result;
}
