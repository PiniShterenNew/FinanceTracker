import React, { useState } from 'react';
import { useI18n } from '@/components/ui/i18n-provider';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { format } from 'date-fns';
import { Transaction, TransactionType } from '@/types';

const TransactionsList: React.FC = () => {
  const { isHebrew } = useI18n();
  const { getAllTransactions, getTransactionsByDate } = useTransactions();
  const { getCategoryById } = useCategories();
  
  const [filterType, setFilterType] = useState<TransactionType | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Get transactions and group by date
  const allTransactions = getAllTransactions();
  
  // Filter transactions based on type and search term
  const filteredTransactions = allTransactions.filter(t => {
    const matchesType = filterType === 'all' || t.type === filterType;
    const category = getCategoryById(t.category);
    const categoryName = isHebrew ? category?.nameHe : category?.name;
    const matchesSearch = !searchTerm || 
      categoryName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });
  
  // Group transactions by date
  const transactionsByDate = getTransactionsByDate(filteredTransactions);
  
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
  
  const formatGroupDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (dateString === format(today, 'yyyy-MM-dd')) {
      return isHebrew ? 'היום' : 'Today';
    } else if (dateString === format(yesterday, 'yyyy-MM-dd')) {
      return isHebrew ? 'אתמול' : 'Yesterday';
    } else {
      return format(date, 'MMM d, yyyy');
    }
  };
  
  return (
    <div className="space-y-6 pb-16">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">{isHebrew ? 'עסקאות' : 'Transactions'}</h2>
        <div className="flex space-x-2 rtl:space-x-reverse">
          <div className="relative">
            <input 
              type="text" 
              placeholder={isHebrew ? "חיפוש עסקאות..." : "Search transactions..."} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-card text-sm w-full focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent"
            />
            <span className="material-icons absolute left-2 rtl:right-2 rtl:left-auto top-2 text-gray-400">search</span>
          </div>
          <button className="p-2 rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-card text-gray-500">
            <span className="material-icons">filter_list</span>
          </button>
        </div>
      </div>
      
      {/* Filter Pills */}
      <div className="flex flex-wrap gap-2">
        <button 
          onClick={() => setFilterType('all')} 
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            filterType === 'all' 
              ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300' 
              : 'bg-gray-100 dark:bg-dark-card text-gray-700 dark:text-gray-300'
          }`}
        >
          {isHebrew ? 'הכל' : 'All'}
        </button>
        <button 
          onClick={() => setFilterType('income')} 
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            filterType === 'income' 
              ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300' 
              : 'bg-gray-100 dark:bg-dark-card text-gray-700 dark:text-gray-300'
          }`}
        >
          {isHebrew ? 'הכנסות' : 'Income'}
        </button>
        <button 
          onClick={() => setFilterType('expense')} 
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            filterType === 'expense' 
              ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300' 
              : 'bg-gray-100 dark:bg-dark-card text-gray-700 dark:text-gray-300'
          }`}
        >
          {isHebrew ? 'הוצאות' : 'Expenses'}
        </button>
        <button className="px-3 py-1 bg-gray-100 dark:bg-dark-card text-gray-700 dark:text-gray-300 rounded-full text-sm flex items-center gap-1">
          <span>{isHebrew ? 'תאריך' : 'Date'}</span>
          <span className="material-icons text-xs">expand_more</span>
        </button>
        <button className="px-3 py-1 bg-gray-100 dark:bg-dark-card text-gray-700 dark:text-gray-300 rounded-full text-sm flex items-center gap-1">
          <span>{isHebrew ? 'קטגוריה' : 'Category'}</span>
          <span className="material-icons text-xs">expand_more</span>
        </button>
      </div>
      
      {/* Transaction Groups */}
      <div className="space-y-6">
        {Object.keys(transactionsByDate).length === 0 ? (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400">
            {isHebrew ? 'לא נמצאו עסקאות' : 'No transactions found'}
          </div>
        ) : (
          Object.entries(transactionsByDate).map(([dateString, transactions]) => (
            <div key={dateString}>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                {formatGroupDate(dateString)}
              </h3>
              <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm divide-y divide-gray-100 dark:divide-dark-border">
                {transactions.map(transaction => {
                  const category = getCategoryById(transaction.category);
                  return (
                    <div className="p-4 flex items-center" key={transaction.id}>
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
                              {format(new Date(transaction.timestamp), 'h:mm a')}
                            </p>
                          </div>
                          <span className={transaction.type === 'income' ? 'text-green-500 font-medium' : 'text-red-500 font-medium'}>
                            {transaction.type === 'income' ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TransactionsList;
