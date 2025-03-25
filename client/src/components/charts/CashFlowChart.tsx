import React, { useEffect, useRef } from "react";
import { TransactionData } from "@shared/schema";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { useAppContext } from "@/context/AppContext";
import { useTranslation } from "react-i18next";
import { format, subDays, startOfDay, endOfDay, eachDayOfInterval, getMonth, getYear, startOfMonth, endOfMonth, subMonths } from "date-fns";

interface CashFlowChartProps {
  transactions: TransactionData[];
  timeRange: "daily" | "weekly" | "monthly";
  chartData?: any[]; // Optional pre-processed data
}

interface ChartData {
  name: string;
  income: number;
  expenses: number;
  date: Date;
}

const CashFlowChart: React.FC<CashFlowChartProps> = ({ transactions, timeRange, chartData }) => {
  const { t } = useTranslation();
  const { currency } = useAppContext();
  
  // If pre-processed data is provided, use it
  if (chartData) {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{
            top: 5,
            right: 5,
            left: 5,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip 
            formatter={(value: number) => [`${currency}${value.toFixed(2)}`, ""]}
            labelFormatter={(label) => label}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="income" 
            stroke="#3B82F6" 
            strokeWidth={3} 
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line 
            type="monotone" 
            dataKey="expenses" 
            stroke="#EF4444" 
            strokeWidth={3} 
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }
  
  // Otherwise, process the data based on the time range
  const now = new Date();
  let data: ChartData[] = [];
  
  if (timeRange === "daily") {
    // Last 7 days
    const startDate = startOfDay(subDays(now, 6));
    const endDate = endOfDay(now);
    
    // Generate an array of dates for the last 7 days
    const dateRange = eachDayOfInterval({ start: startDate, end: endDate });
    
    data = dateRange.map(date => {
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);
      
      // Filter transactions for this day
      const dayTransactions = transactions.filter(
        t => new Date(t.date) >= dayStart && new Date(t.date) <= dayEnd
      );
      
      // Calculate income and expenses
      const income = dayTransactions
        .filter(t => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0);
      
      const expenses = dayTransactions
        .filter(t => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      
      return {
        name: format(date, "EEE"),
        income,
        expenses,
        date
      };
    });
  } else if (timeRange === "weekly") {
    // Last 4 weeks
    // For simplicity, we'll just do 4 weeks (28 days) back
    for (let i = 0; i < 4; i++) {
      const weekStart = subDays(now, 7 * (i + 1) - 1);
      const weekEnd = subDays(now, 7 * i);
      
      // Filter transactions for this week
      const weekTransactions = transactions.filter(
        t => new Date(t.date) >= weekStart && new Date(t.date) <= weekEnd
      );
      
      // Calculate income and expenses
      const income = weekTransactions
        .filter(t => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0);
      
      const expenses = weekTransactions
        .filter(t => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      
      data.unshift({
        name: `Week ${i + 1}`,
        income,
        expenses,
        date: weekStart
      });
    }
  } else if (timeRange === "monthly") {
    // Last 6 months
    for (let i = 0; i < 6; i++) {
      const monthDate = subMonths(now, i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);
      
      // Filter transactions for this month
      const monthTransactions = transactions.filter(
        t => new Date(t.date) >= monthStart && new Date(t.date) <= monthEnd
      );
      
      // Calculate income and expenses
      const income = monthTransactions
        .filter(t => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0);
      
      const expenses = monthTransactions
        .filter(t => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      
      data.unshift({
        name: format(monthDate, "MMM"),
        income,
        expenses,
        date: monthStart
      });
    }
  }
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{
          top: 5,
          right: 5,
          left: 5,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip 
          formatter={(value: number) => [`${currency}${value.toFixed(2)}`, ""]}
          labelFormatter={(label) => label}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="income" 
          stroke="#3B82F6" 
          strokeWidth={3} 
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
          name={t("income")}
        />
        <Line 
          type="monotone" 
          dataKey="expenses" 
          stroke="#EF4444" 
          strokeWidth={3} 
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
          name={t("expenses")}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default CashFlowChart;
