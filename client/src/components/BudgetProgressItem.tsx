import React from "react";
import { useTranslation } from "react-i18next";
import { Progress } from "@/components/ui/progress";
import { BudgetData, TransactionData } from "@shared/schema";
import { format } from "date-fns";
import CategoryIcon from "./CategoryIcon";

interface BudgetProgressItemProps {
  budget: BudgetData;
  transactions: TransactionData[];
  currency: string;
}

const BudgetProgressItem: React.FC<BudgetProgressItemProps> = ({ 
  budget, 
  transactions,
  currency 
}) => {
  const { t } = useTranslation();
  
  // Calculate total spent in this category for the budget period
  const totalSpent = transactions
    .filter((t) => {
      const transactionDate = new Date(t.date);
      const startDate = new Date(budget.startDate);
      const endDate = new Date(budget.endDate);
      
      return (
        t.category === budget.category && 
        t.type === "expense" && 
        transactionDate >= startDate && 
        transactionDate <= endDate
      );
    })
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  
  // Calculate percentage
  const percentage = Math.min(Math.round((totalSpent / budget.amount) * 100), 100);
  
  // Determine status color
  let statusColor = "bg-primary"; // Default
  
  if (percentage >= 100) {
    statusColor = "bg-negative";
  } else if (percentage >= 80) {
    statusColor = "bg-amber-500";
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center">
          <CategoryIcon categoryId={budget.category} className="w-8 h-8 mr-2" />
          <span>{t(`categories.${budget.category}`)}</span>
        </div>
        <span className={percentage >= 100 ? "text-negative" : ""}>
          {currency}{totalSpent.toFixed(2)}/{currency}{budget.amount.toFixed(2)}
        </span>
      </div>
      <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2 mb-1">
        <div 
          className={`${statusColor} h-2 rounded-full transition-all duration-300`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>
          {format(new Date(budget.startDate), "MMM d")} - {format(new Date(budget.endDate), "MMM d, yyyy")}
        </span>
        <span>{percentage}%</span>
      </div>
    </div>
  );
};

export default BudgetProgressItem;
