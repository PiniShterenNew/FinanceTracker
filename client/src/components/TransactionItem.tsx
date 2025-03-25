import React from "react";
import { format } from "date-fns";
import { TransactionData } from "@shared/schema";
import CategoryIcon from "./CategoryIcon";

interface TransactionItemProps {
  transaction: TransactionData;
  currency: string;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction, currency }) => {
  const { amount, type, category, description, date } = transaction;
  
  // Format the date
  const formattedDate = format(new Date(date), "PPP, p");
  const isToday = format(new Date(date), "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
  const isYesterday = format(new Date(date), "yyyy-MM-dd") === format(new Date(Date.now() - 86400000), "yyyy-MM-dd");
  
  const displayDate = isToday 
    ? `Today, ${format(new Date(date), "p")}` 
    : isYesterday 
      ? `Yesterday, ${format(new Date(date), "p")}`
      : formattedDate;
  
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <CategoryIcon categoryId={category} className="mr-3" />
        <div>
          <p className="font-medium">{description || category}</p>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">{displayDate}</p>
        </div>
      </div>
      <span className={`font-medium ${amount < 0 ? "text-negative" : "text-positive"}`}>
        {amount < 0 ? "-" : "+"}{currency}{Math.abs(amount).toFixed(2)}
      </span>
    </div>
  );
};

export default TransactionItem;
