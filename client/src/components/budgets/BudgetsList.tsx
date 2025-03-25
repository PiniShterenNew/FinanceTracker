import React, { useState } from 'react';
import { useI18n } from '@/components/ui/i18n-provider';
import { useBudgets } from '@/hooks/useBudgets';
import { useCategories } from '@/hooks/useCategories';
import { addMonths, subMonths, format } from 'date-fns';
import { Budget } from '@/types';

const BudgetsList: React.FC = () => {
  const { isHebrew } = useI18n();
  const { getBudgets, getBudgetStatus, addBudget } = useBudgets();
  const { getCategoryById } = useCategories();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const handlePrevMonth = () => {
    setCurrentDate(prev => subMonths(prev, 1));
  };
  
  const handleNextMonth = () => {
    setCurrentDate(prev => addMonths(prev, 1));
  };
  
  const budgets = getBudgets(currentDate);
  
  const getCategoryIcon = (budget: Budget) => {
    const category = getCategoryById(budget.categoryId);
    return category ? category.icon : 'category';
  };
  
  const getCategoryIconBgClass = (budget: Budget) => {
    const category = getCategoryById(budget.categoryId);
    
    switch (category?.id) {
      case 'food':
        return 'bg-amber-100 dark:bg-amber-900/20 text-amber-500';
      case 'shopping':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-500';
      case 'housing':
        return 'bg-green-100 dark:bg-green-900/20 text-green-500';
      case 'entertainment':
        return 'bg-purple-100 dark:bg-purple-900/20 text-purple-500';
      default:
        return 'bg-gray-100 dark:bg-gray-900/20 text-gray-500';
    }
  };
  
  const getBudgetStatusColor = (budget: Budget) => {
    const { percentage } = getBudgetStatus(budget.id);
    
    if (percentage >= 90) {
      return {
        bar: 'bg-red-500',
        text: 'text-red-500'
      };
    } else if (percentage >= 75) {
      return {
        bar: 'bg-amber-500',
        text: 'text-amber-500'
      };
    } else {
      return {
        bar: 'bg-green-500',
        text: 'text-green-500'
      };
    }
  };
  
  // Get overall budget status
  const totalBudget = budgets.reduce((acc, budget) => acc + budget.amount, 0);
  const totalSpent = budgets.reduce((acc, budget) => {
    const { spent } = getBudgetStatus(budget.id);
    return acc + spent;
  }, 0);
  const remainingBudget = totalBudget - totalSpent;
  const remainingPercentage = Math.round((remainingBudget / totalBudget) * 100) || 0;
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const today = new Date().getDate();
  const daysRemaining = daysInMonth - today;
  const dailyBudget = remainingBudget / Math.max(daysRemaining, 1);
  
  return (
    <div className="space-y-6 pb-16">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">{isHebrew ? 'תקציבים' : 'Budgets'}</h2>
        <button className="px-3 py-1.5 bg-primary-500 text-white rounded-lg text-sm font-medium flex items-center">
          <span className="material-icons text-sm mr-1 rtl:ml-1 rtl:mr-0">add</span>
          <span>{isHebrew ? 'תקציב חדש' : 'New Budget'}</span>
        </button>
      </div>
      
      {/* Month Selector */}
      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={handlePrevMonth}
          className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-dark-card"
        >
          <span className="material-icons text-gray-500">
            {isHebrew ? 'chevron_right' : 'chevron_left'}
          </span>
        </button>
        <h3 className="text-lg font-semibold">{format(currentDate, 'MMMM yyyy')}</h3>
        <button 
          onClick={handleNextMonth}
          className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-dark-card"
        >
          <span className="material-icons text-gray-500">
            {isHebrew ? 'chevron_left' : 'chevron_right'}
          </span>
        </button>
      </div>
      
      {/* Budget Overview */}
      <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm p-4">
        <h3 className="font-medium mb-3">{isHebrew ? 'סקירת תקציב' : 'Budget Overview'}</h3>
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
          <div className="flex-1">
            <div className="w-full bg-gray-200 dark:bg-dark-border rounded-full h-3">
              <div 
                className="bg-primary-500 h-3 rounded-full" 
                style={{ width: `${remainingPercentage}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span className="text-gray-500 dark:text-gray-400">
                {isHebrew ? 'נשאר' : 'Remaining'}
              </span>
              <span className="font-medium">
                ${remainingBudget.toFixed(2)} / ${totalBudget.toFixed(2)}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 md:w-1/3">
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
              <p className="text-xs text-green-600 dark:text-green-400">
                {isHebrew ? 'נותר' : 'Remaining'}
              </p>
              <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                ${remainingBudget.toFixed(2)}
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <p className="text-xs text-blue-600 dark:text-blue-400">
                {isHebrew ? 'ליום' : 'Per Day'}
              </p>
              <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                ${dailyBudget.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Budget Categories */}
      <div className="space-y-4">
        {budgets.length === 0 ? (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400">
            {isHebrew ? 'אין תקציבים מוגדרים' : 'No budgets defined'}
          </div>
        ) : (
          budgets.map(budget => {
            const category = getCategoryById(budget.categoryId);
            const { spent, remaining, percentage } = getBudgetStatus(budget.id);
            const colors = getBudgetStatusColor(budget);
            
            return (
              <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm p-4" key={budget.id}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full ${getCategoryIconBgClass(budget)} flex items-center justify-center mr-3 rtl:ml-3 rtl:mr-0`}>
                      <span className="material-icons">{getCategoryIcon(budget)}</span>
                    </div>
                    <h4 className="font-medium">
                      {isHebrew ? category?.nameHe : category?.name}
                    </h4>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold">
                      ${spent.toFixed(2)} <span className="text-sm font-normal text-gray-500 dark:text-gray-400">/ ${budget.amount.toFixed(2)}</span>
                    </p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-dark-border rounded-full h-2">
                  <div 
                    className={`${colors.bar} h-2 rounded-full`} 
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span className="text-gray-500 dark:text-gray-400">{percentage}% used</span>
                  <span className={colors.text + ' font-medium'}>${remaining.toFixed(2)} left</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default BudgetsList;
