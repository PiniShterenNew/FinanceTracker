import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useI18n } from '@/components/ui/i18n-provider';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { TransactionType } from '@/types';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Form schema
const transactionSchema = z.object({
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  type: z.enum(["income", "expense"]),
  category: z.string().min(1, "Category is required"),
  date: z.string().min(1, "Date is required"),
  description: z.string().optional(),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ isOpen, onClose }) => {
  const { isHebrew } = useI18n();
  const { addTransaction } = useTransactions();
  const { getCategories } = useCategories();
  const [transactionType, setTransactionType] = useState<TransactionType>('income');
  
  const categories = getCategories(transactionType);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      amount: undefined,
      type: 'income',
      category: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
    }
  });
  
  const onSubmit = (data: TransactionFormValues) => {
    addTransaction({
      ...data,
      id: Date.now().toString(),
      amount: Number(data.amount),
      timestamp: new Date(data.date).getTime(),
    });
    
    reset();
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        
        <div className="inline-block align-bottom bg-white dark:bg-dark-card rounded-t-xl sm:rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">{isHebrew ? 'הוספת עסקה חדשה' : 'Add New Transaction'}</h3>
              <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-dark-border">
                <span className="material-icons text-gray-500">close</span>
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Transaction Type */}
              <div className="flex space-x-2 rtl:space-x-reverse">
                <button
                  type="button"
                  onClick={() => {
                    setTransactionType('income');
                    register('type', { value: 'income' });
                  }}
                  className={`
                    flex-1 py-2 border-2 rounded-lg flex justify-center items-center space-x-2 rtl:space-x-reverse
                    ${transactionType === 'income' 
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' 
                      : 'border border-gray-300 dark:border-dark-border text-gray-700 dark:text-gray-300'}
                  `}
                >
                  <span className="material-icons">add_circle</span>
                  <span>{isHebrew ? 'הכנסה' : 'Income'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTransactionType('expense');
                    register('type', { value: 'expense' });
                  }}
                  className={`
                    flex-1 py-2 border-2 rounded-lg flex justify-center items-center space-x-2 rtl:space-x-reverse
                    ${transactionType === 'expense' 
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' 
                      : 'border border-gray-300 dark:border-dark-border text-gray-700 dark:text-gray-300'}
                  `}
                >
                  <span className="material-icons">remove_circle</span>
                  <span>{isHebrew ? 'הוצאה' : 'Expense'}</span>
                </button>
              </div>
              
              {/* Amount Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {isHebrew ? 'סכום' : 'Amount'}
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 rtl:right-0 rtl:left-auto pl-3 rtl:pr-3 rtl:pl-0 flex items-center text-gray-500">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    {...register('amount', { valueAsNumber: true })}
                    className="pl-8 rtl:pr-8 rtl:pl-4 pr-4 py-2 w-full rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-background focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent"
                  />
                </div>
                {errors.amount && (
                  <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
                )}
              </div>
              
              {/* Category Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {isHebrew ? 'קטגוריה' : 'Category'}
                </label>
                <div className="relative">
                  <select
                    {...register('category')}
                    className="appearance-none pl-10 rtl:pr-10 rtl:pl-4 pr-4 py-2 w-full rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-background focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent"
                  >
                    <option value="">{isHebrew ? 'בחר קטגוריה' : 'Select category'}</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {isHebrew ? category.nameHe : category.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 left-0 rtl:right-0 rtl:left-auto pl-3 rtl:pr-3 rtl:pl-0 flex items-center pointer-events-none">
                    <span className="material-icons text-gray-500">category</span>
                  </div>
                  <div className="absolute inset-y-0 right-0 rtl:left-0 rtl:right-auto pr-2 rtl:pl-2 rtl:pr-0 flex items-center pointer-events-none">
                    <span className="material-icons text-gray-500">expand_more</span>
                  </div>
                </div>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                )}
              </div>
              
              {/* Date Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {isHebrew ? 'תאריך' : 'Date'}
                </label>
                <div className="relative">
                  <input
                    type="date"
                    {...register('date')}
                    className="pl-10 rtl:pr-10 rtl:pl-4 pr-4 py-2 w-full rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-background focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent"
                  />
                  <div className="absolute inset-y-0 left-0 rtl:right-0 rtl:left-auto pl-3 rtl:pr-3 rtl:pl-0 flex items-center pointer-events-none">
                    <span className="material-icons text-gray-500">calendar_today</span>
                  </div>
                </div>
                {errors.date && (
                  <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
                )}
              </div>
              
              {/* Description Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {isHebrew ? 'תיאור' : 'Description'}
                </label>
                <textarea
                  rows={2}
                  {...register('description')}
                  className="px-4 py-2 w-full rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-background focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent"
                  placeholder={isHebrew ? 'אופציונלי' : 'Optional'}
                />
              </div>
              
              <div className="px-4 py-3 bg-gray-50 dark:bg-dark-background sm:px-6 flex space-x-2 rtl:space-x-reverse">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full inline-flex justify-center rounded-lg border border-gray-300 dark:border-dark-border shadow-sm px-4 py-2 bg-white dark:bg-dark-card text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-primary-400 sm:w-auto sm:text-sm"
                >
                  {isHebrew ? 'ביטול' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-primary-500 text-base font-medium text-white hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:w-auto sm:text-sm"
                >
                  {isHebrew ? 'שמור' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddTransactionModal;
