import React from "react";
import { CATEGORIES } from "@shared/schema";

interface CategoryIconProps {
  categoryId: string;
  className?: string;
}

const CategoryIcon: React.FC<CategoryIconProps> = ({ categoryId, className = "" }) => {
  // Find the category by ID
  const category = CATEGORIES.find((cat) => cat.id === categoryId);
  
  // Default icon if category is not found
  const iconName = category ? category.icon : "category";
  
  // Map categories to colors
  const categoryColorMap: Record<string, string> = {
    food: "text-primary bg-blue-100 dark:bg-blue-900/30",
    shopping: "text-purple-500 bg-purple-100 dark:bg-purple-900/30",
    transport: "text-amber-500 bg-amber-100 dark:bg-amber-900/30",
    entertainment: "text-green-500 bg-green-100 dark:bg-green-900/30",
    utilities: "text-neutral-500 bg-neutral-100 dark:bg-neutral-900/30",
    health: "text-red-500 bg-red-100 dark:bg-red-900/30",
    housing: "text-orange-500 bg-orange-100 dark:bg-orange-900/30",
    education: "text-indigo-500 bg-indigo-100 dark:bg-indigo-900/30",
    personal: "text-pink-500 bg-pink-100 dark:bg-pink-900/30",
    travel: "text-sky-500 bg-sky-100 dark:bg-sky-900/30",
    income: "text-green-500 bg-green-100 dark:bg-green-900/30",
    savings: "text-purple-500 bg-purple-100 dark:bg-purple-900/30",
    other: "text-neutral-500 bg-neutral-100 dark:bg-neutral-900/30"
  };
  
  // Get color for this category
  const colorClass = categoryColorMap[categoryId] || categoryColorMap.other;
  
  return (
    <div className={`w-10 h-10 rounded-full ${colorClass} flex items-center justify-center ${className}`}>
      <span className="material-icons">{iconName}</span>
    </div>
  );
};

export default CategoryIcon;
