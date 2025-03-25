import React from 'react';
import { useI18n } from '@/components/ui/i18n-provider';
import { useTransactions } from '@/hooks/useTransactions';
import { useBudgets } from '@/hooks/useBudgets';

const BalanceCard: React.FC = () => {
  const { isHebrew } = useI18n();
  const { getTotalBalance, getMonthlyChange } = useTransactions();
  const { getRemainingBudget, getBudgetPercentage, getDaysRemaining } = useBudgets();
  
  const currentBalance = getTotalBalance();
  const monthlyChange = getMonthlyChange();
  const remainingBudget = getRemainingBudget();
  const budgetPercentage = getBudgetPercentage();
  const daysToGo = getDaysRemaining();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm p-4">
        <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-1">
          {isHebrew ? 'יתרה נוכחית' : 'Current Balance'}
        </h3>
        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
          ${currentBalance.toFixed(2)}
        </p>
        <div className="flex items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
          <span className={`material-icons text-base mr-1 rtl:ml-1 rtl:mr-0 ${
            monthlyChange >= 0 ? 'text-green-500' : 'text-red-500'
          }`}>
            {monthlyChange >= 0 ? 'trending_up' : 'trending_down'}
          </span>
          <span>
            {monthlyChange >= 0 ? '+' : ''}{monthlyChange.toFixed(1)}% from last month
          </span>
        </div>
      </div>
      
      <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm p-4">
        <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-1">
          {isHebrew ? 'תקציב נותר' : 'Remaining Budget'}
        </h3>
        <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
          ${remainingBudget.toFixed(2)}
        </p>
        <div className="w-full bg-gray-200 dark:bg-dark-border rounded-full h-2 mt-2">
          <div 
            className="bg-primary-500 h-2 rounded-full" 
            style={{ width: `${budgetPercentage}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs mt-1">
          <span className="text-gray-500 dark:text-gray-400">{budgetPercentage}% left</span>
          <span className="text-gray-500 dark:text-gray-400">{daysToGo} days to go</span>
        </div>
      </div>
    </div>
  );
};

export default BalanceCard;
