import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { useI18n } from '@/components/ui/i18n-provider';
import { useTheme } from '@/components/ui/theme-provider';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';

// Register Chart.js components
Chart.register(...registerables);

const SpendingCategoriesChart: React.FC = () => {
  const { isHebrew } = useI18n();
  const { theme } = useTheme();
  const { getCategorySpending } = useTransactions();
  const { getCategories } = useCategories();
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  
  const expenseCategories = getCategories('expense');
  const categorySpending = getCategorySpending();
  
  useEffect(() => {
    if (!chartRef.current) return;
    
    const textColor = theme === 'dark' ? '#D1D5DB' : '#374151';
    
    // Collect data for chart
    const labels = expenseCategories.map(cat => isHebrew ? cat.nameHe : cat.name);
    const data = expenseCategories.map(cat => {
      const spending = categorySpending.find(cs => cs.categoryId === cat.id);
      return spending ? spending.amount : 0;
    });
    
    const bgColors = [
      'rgba(59, 130, 246, 0.8)',
      'rgba(34, 197, 94, 0.8)',
      'rgba(245, 158, 11, 0.8)',
      'rgba(139, 92, 246, 0.8)',
      'rgba(107, 114, 128, 0.8)'
    ];
    
    // Destroy previous chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    
    // Create new chart
    const ctx = chartRef.current.getContext('2d');
    if (ctx) {
      chartInstance.current = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels,
          datasets: [{
            data,
            backgroundColor: bgColors,
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          cutout: '75%'
        }
      });
    }
    
    // Cleanup function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [expenseCategories, categorySpending, isHebrew, theme]);
  
  // Get top categories for the list display
  const topCategories = categorySpending
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 4);
  
  const getCategoryColorClass = (index: number) => {
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-amber-500', 'bg-violet-500'];
    return colors[index % colors.length];
  };
  
  return (
    <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">
          {isHebrew ? 'קטגוריות הוצאות' : 'Spending Categories'}
        </h3>
        <button 
          onClick={() => {}} 
          className="text-primary-500 text-sm font-medium"
        >
          <span>{isHebrew ? 'הצג הכל' : 'View All'}</span>
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <canvas ref={chartRef} className="h-48"></canvas>
        </div>
        <div className="space-y-4">
          {topCategories.map((category, index) => {
            const categoryInfo = expenseCategories.find(cat => cat.id === category.categoryId);
            if (!categoryInfo) return null;
            
            const percentage = Math.round((category.amount / (category.total || 1)) * 100);
            
            return (
              <div className="flex items-center" key={category.categoryId}>
                <div className={`w-3 h-3 rounded-full ${getCategoryColorClass(index)} mr-2 rtl:ml-2 rtl:mr-0`}></div>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span>{isHebrew ? categoryInfo.nameHe : categoryInfo.name}</span>
                    <span className="font-medium">${category.amount.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-dark-border rounded-full h-1.5">
                    <div 
                      className={`${getCategoryColorClass(index)} h-1.5 rounded-full`} 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SpendingCategoriesChart;
