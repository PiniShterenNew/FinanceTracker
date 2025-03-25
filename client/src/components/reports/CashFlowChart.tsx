import React, { useEffect, useRef, useState } from 'react';
import { Chart, registerables } from 'chart.js';
import { useI18n } from '@/components/ui/i18n-provider';
import { useTheme } from '@/components/ui/theme-provider';
import { useTransactions } from '@/hooks/useTransactions';
import { format, subMonths } from 'date-fns';

// Register Chart.js components
Chart.register(...registerables);

type TimeFrame = 'monthly' | 'weekly' | 'daily';

const CashFlowChart: React.FC = () => {
  const { isHebrew } = useI18n();
  const { theme } = useTheme();
  const { getCashFlowData } = useTransactions();
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('monthly');
  
  useEffect(() => {
    if (!chartRef.current) return;
    
    const textColor = theme === 'dark' ? '#D1D5DB' : '#374151';
    const gridColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
    
    // Get data based on time frame
    const { labels, incomeData, expenseData } = getCashFlowData(timeFrame);
    
    // Destroy previous chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    
    // Create new chart
    const ctx = chartRef.current.getContext('2d');
    if (ctx) {
      chartInstance.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: isHebrew ? 'הכנסות' : 'Income',
              data: incomeData,
              backgroundColor: 'rgba(34, 197, 94, 0.8)',
              borderRadius: 4
            },
            {
              label: isHebrew ? 'הוצאות' : 'Expenses',
              data: expenseData,
              backgroundColor: 'rgba(239, 68, 68, 0.8)',
              borderRadius: 4
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                display: true,
                color: gridColor
              },
              ticks: {
                callback: function(value) {
                  return '$' + value;
                },
                color: textColor
              }
            },
            x: {
              grid: {
                display: false
              },
              ticks: {
                color: textColor
              }
            }
          }
        }
      });
    }
    
    // Cleanup function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [getCashFlowData, timeFrame, isHebrew, theme]);
  
  // Generate summary data for the current month and previous month
  const currentDate = new Date();
  const currentMonthData = getCashFlowData('monthly');
  const currentMonthIncome = currentMonthData.incomeData[currentMonthData.incomeData.length - 1] || 0;
  const currentMonthExpense = currentMonthData.expenseData[currentMonthData.expenseData.length - 1] || 0;
  const currentMonthSavings = currentMonthIncome - currentMonthExpense;
  
  // Calculate changes from last month
  const lastMonthIndex = currentMonthData.labels.length - 2;
  const lastMonthIncome = currentMonthData.incomeData[lastMonthIndex] || 0;
  const lastMonthExpense = currentMonthData.expenseData[lastMonthIndex] || 0;
  const lastMonthSavings = lastMonthIncome - lastMonthExpense;
  
  const incomeChange = lastMonthIncome ? ((currentMonthIncome - lastMonthIncome) / lastMonthIncome) * 100 : 0;
  const expenseChange = lastMonthExpense ? ((currentMonthExpense - lastMonthExpense) / lastMonthExpense) * 100 : 0;
  const savingsChange = lastMonthSavings ? ((currentMonthSavings - lastMonthSavings) / lastMonthSavings) * 100 : 0;
  
  return (
    <div className="space-y-6">
      {/* Report Tabs */}
      <div className="flex border-b border-gray-200 dark:border-dark-border">
        <button className="px-4 py-2 border-b-2 border-primary-500 text-primary-600 dark:text-primary-400">
          <span>{isHebrew ? 'תזרים מזומנים' : 'Cash Flow'}</span>
        </button>
        <button className="px-4 py-2 text-gray-500 dark:text-gray-400">
          <span>{isHebrew ? 'הוצאות' : 'Expenses'}</span>
        </button>
        <button className="px-4 py-2 text-gray-500 dark:text-gray-400">
          <span>{isHebrew ? 'הכנסות' : 'Income'}</span>
        </button>
        <button className="px-4 py-2 text-gray-500 dark:text-gray-400">
          <span>{isHebrew ? 'חסכונות' : 'Savings'}</span>
        </button>
      </div>
      
      {/* Report Time Period Selector */}
      <div className="flex space-x-2 rtl:space-x-reverse">
        <button 
          onClick={() => setTimeFrame('monthly')}
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            timeFrame === 'monthly' 
              ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300' 
              : 'bg-gray-100 dark:bg-dark-card text-gray-700 dark:text-gray-300'
          }`}
        >
          <span>{isHebrew ? 'חודשי' : 'Monthly'}</span>
        </button>
        <button 
          onClick={() => setTimeFrame('weekly')}
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            timeFrame === 'weekly' 
              ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300' 
              : 'bg-gray-100 dark:bg-dark-card text-gray-700 dark:text-gray-300'
          }`}
        >
          <span>{isHebrew ? 'שבועי' : 'Weekly'}</span>
        </button>
        <button 
          onClick={() => setTimeFrame('daily')}
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            timeFrame === 'daily' 
              ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300' 
              : 'bg-gray-100 dark:bg-dark-card text-gray-700 dark:text-gray-300'
          }`}
        >
          <span>{isHebrew ? 'יומי' : 'Daily'}</span>
        </button>
      </div>
      
      {/* Cash Flow Chart */}
      <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium">{isHebrew ? 'תזרים מזומנים' : 'Cash Flow'}</h3>
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-green-500 mr-1 rtl:ml-1 rtl:mr-0"></span>
            <span className="text-sm text-gray-600 dark:text-gray-400 mr-3 rtl:ml-3 rtl:mr-0">
              {isHebrew ? 'הכנסות' : 'Income'}
            </span>
            <span className="w-3 h-3 rounded-full bg-red-500 mr-1 rtl:ml-1 rtl:mr-0"></span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {isHebrew ? 'הוצאות' : 'Expenses'}
            </span>
          </div>
        </div>
        <div className="h-72">
          <canvas ref={chartRef}></canvas>
        </div>
      </div>
      
      {/* Monthly Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm p-4">
          <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            {isHebrew ? 'סך כל ההכנסות' : 'Total Income'}
          </h3>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            ${currentMonthIncome.toFixed(2)}
          </p>
          <div className="flex items-center mt-2 text-sm">
            <span className={`material-icons text-base mr-1 rtl:ml-1 rtl:mr-0 ${
              incomeChange >= 0 ? 'text-green-500' : 'text-red-500'
            }`}>
              {incomeChange >= 0 ? 'trending_up' : 'trending_down'}
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              {incomeChange >= 0 ? '+' : ''}{incomeChange.toFixed(1)}% from last month
            </span>
          </div>
        </div>
        
        <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm p-4">
          <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            {isHebrew ? 'סך כל ההוצאות' : 'Total Expenses'}
          </h3>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            ${currentMonthExpense.toFixed(2)}
          </p>
          <div className="flex items-center mt-2 text-sm">
            <span className={`material-icons text-base mr-1 rtl:ml-1 rtl:mr-0 ${
              expenseChange <= 0 ? 'text-green-500' : 'text-red-500'
            }`}>
              {expenseChange <= 0 ? 'trending_down' : 'trending_up'}
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              {expenseChange >= 0 ? '+' : ''}{expenseChange.toFixed(1)}% from last month
            </span>
          </div>
        </div>
        
        <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm p-4">
          <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            {isHebrew ? 'סך כל החיסכון' : 'Total Savings'}
          </h3>
          <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
            ${currentMonthSavings.toFixed(2)}
          </p>
          <div className="flex items-center mt-2 text-sm">
            <span className={`material-icons text-base mr-1 rtl:ml-1 rtl:mr-0 ${
              savingsChange >= 0 ? 'text-primary-500' : 'text-red-500'
            }`}>
              {savingsChange >= 0 ? 'trending_up' : 'trending_down'}
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              {savingsChange >= 0 ? '+' : ''}{savingsChange.toFixed(1)}% from last month
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashFlowChart;
