import React from 'react';
import { useI18n } from '@/components/ui/i18n-provider';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { format } from 'date-fns';
import { Transaction } from '@/types';

const RecentTransactions: React.FC = () => {
  const { isHebrew } = useI18n();
  const { getRecentTransactions } = useTransactions();
  const { getCategoryById } = useCategories();
  
  const transactions = getRecentTransactions(3);
  
  const getCategoryIcon = (transaction: Transaction) => {
    const category = getCategoryById(transaction.category);
    return category ? category.icon : transaction.type === 'income' ? 'add_circle' : 'remove_circle';
  };
  
  const getCategoryIconBgClass = (transaction: Transaction) => {
    if (transaction.type === 'income') {
      return 'bg-green-100 dark:bg-green-900/20 text-green-500';
    }
    
    const category = getCategoryById(transaction.category);
    
    switch (category?.id) {
      case 'shopping':
        return 'bg-red-100 dark:bg-red-900/20 text-red-500';
      case 'food':
        return 'bg-amber-100 dark:bg-amber-900/20 text-amber-500';
      case 'transportation':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-500';
      case 'entertainment':
        return 'bg-purple-100 dark:bg-purple-900/20 text-purple-500';
      default:
        return 'bg-gray-100 dark:bg-gray-900/20 text-gray-500';
    }
  };
  
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return `Today, ${format(date, 'h:mm a')}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${format(date, 'h:mm a')}`;
    } else {
      return format(date, 'MMM d, h:mm a');
    }
  };
  
  return (
    <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">{isHebrew ? 'עסקאות אחרונות' : 'Recent Transactions'}</h3>
        <button 
          onClick={() => {}} 
          className="text-primary-500 text-sm font-medium"
        >
          <span>{isHebrew ? 'הצג הכל' : 'View All'}</span>
        </button>
      </div>
      <div className="space-y-4">
        {transactions.length === 0 ? (
          <div className="text-center py-6 text-gray-500 dark:text-gray-400">
            {isHebrew ? 'אין עסקאות אחרונות' : 'No recent transactions'}
          </div>
        ) : (
          transactions.map(transaction => {
            const category = getCategoryById(transaction.category);
            
            return (
              <div className="flex items-center" key={transaction.id}>
                <div className={`w-10 h-10 rounded-full ${getCategoryIconBgClass(transaction)} flex items-center justify-center mr-3 rtl:ml-3 rtl:mr-0`}>
                  <span className="material-icons">{getCategoryIcon(transaction)}</span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <div>
                      <h4 className="text-sm font-medium">
                        {isHebrew ? category?.nameHe : category?.name}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(transaction.timestamp)}
                      </p>
                    </div>
                    <span className={transaction.type === 'income' ? 'text-green-500 font-medium' : 'text-red-500 font-medium'}>
                      {transaction.type === 'income' ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default RecentTransactions;
