import React from "react";
import { useAppContext } from "@/context/AppContext";
import { useTranslation } from "react-i18next";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface CategoryDataItem {
  id: string;
  name: string;
  amount: number;
  percentage: number;
  color: string;
  icon?: string;
}

interface CategoryPieChartProps {
  categoryData: CategoryDataItem[];
}

const CategoryPieChart: React.FC<CategoryPieChartProps> = ({ categoryData }) => {
  const { t } = useTranslation();
  const { currency } = useAppContext();
  
  if (categoryData.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p>{t("noDataAvailable")}</p>
        </div>
      </div>
    );
  }
  
  // Prepare data for the pie chart
  const chartData = categoryData.map(category => ({
    name: t(`categories.${category.id}`),
    value: category.amount,
    color: category.color,
    percentage: category.percentage
  }));
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          innerRadius={35}
          outerRadius={70}
          paddingAngle={2}
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => [
            `${currency}${value.toFixed(2)}`,
            t("amount")
          ]}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default CategoryPieChart;
