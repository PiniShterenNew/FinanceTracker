import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { useI18n } from '@/components/ui/i18n-provider';
import { useTheme } from '@/components/ui/theme-provider';
import { useTransactions } from '@/hooks/useTransactions';

// Register Chart.js components
Chart.register(...registerables);

const MonthlyOverviewChart: React.FC = () => {
  const { isHebrew } = useI18n();
  const { theme } = useTheme();
  const { getMonthlyChartData } = useTransactions();
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  
  useEffect(() => {
    if (!chartRef.current) return;
    
    const chartData = getMonthlyChartData();
    const textColor = theme === 'dark' ? '#D1D5DB' : '#374151';
    const gridColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
    
    // Destroy previous chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    
    // Create new chart
    const ctx = chartRef.current.getContext('2d');
    if (ctx) {
      chartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: chartData.labels,
          datasets: [
            {
              label: isHebrew ? 'הכנסות' : 'Income',
              data: chartData.incomeData,
              borderColor: 'rgba(34, 197, 94, 0.8)',
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              tension: 0.4,
              fill: true
            },
            {
              label: isHebrew ? 'הוצאות' : 'Expenses',
              data: chartData.expenseData,
              borderColor: 'rgba(239, 68, 68, 0.8)',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              tension: 0.4,
              fill: true
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'top',
              labels: {
                usePointStyle: true,
                boxWidth: 6,
                color: textColor
              }
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
  }, [getMonthlyChartData, isHebrew, theme]);
  
  return (
    <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm p-4">
      <h3 className="font-medium mb-4">
        {isHebrew ? 'סקירה חודשית' : 'Monthly Overview'}
      </h3>
      <div className="h-64">
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  );
};

export default MonthlyOverviewChart;
