import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppContext } from "@/context/AppContext";
import CategoryPieChart from "@/components/charts/CategoryPieChart";
import CashFlowChart from "@/components/charts/CashFlowChart";
import { 
  getCategoriesWithSpending, 
  getMonthlyStats, 
  getMonthlyExpensesByCategory,
  getIncomesExpensesOverTime
} from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";

const Reports: React.FC = () => {
  const { t } = useTranslation();
  const { transactions, currency } = useAppContext();
  const [timeRange, setTimeRange] = useState<"3m" | "6m" | "1y" | "all">("3m");
  const [activeTab, setActiveTab] = useState("overview");
  
  // Get date range for filtering
  const now = new Date();
  let startDate: Date;
  
  switch (timeRange) {
    case "3m":
      startDate = subMonths(now, 3);
      break;
    case "6m":
      startDate = subMonths(now, 6);
      break;
    case "1y":
      startDate = subMonths(now, 12);
      break;
    case "all":
    default:
      startDate = new Date(0); // Beginning of time
      break;
  }
  
  // Filter transactions by date range
  const filteredTransactions = transactions.filter(
    (t) => new Date(t.date) >= startDate && new Date(t.date) <= now
  );
  
  // Get monthly stats
  const { income, expenses, savings } = getMonthlyStats(filteredTransactions);
  
  // Get category spending
  const categoriesWithSpending = getCategoriesWithSpending(filteredTransactions);
  
  // Get monthly expenses by category for the trend chart
  const monthlyExpensesByCategory = getMonthlyExpensesByCategory(
    filteredTransactions,
    startDate,
    now,
    timeRange === "3m" ? 3 : timeRange === "6m" ? 6 : 12
  );
  
  // Get income vs expenses over time
  const incomesExpensesOverTime = getIncomesExpensesOverTime(
    filteredTransactions,
    startDate,
    now,
    timeRange === "3m" ? 3 : timeRange === "6m" ? 6 : 12
  );
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">{t("reports")}</h2>
        <Select value={timeRange} onValueChange={(v: any) => setTimeRange(v)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder={t("timeRange")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3m">{t("last3Months")}</SelectItem>
            <SelectItem value="6m">{t("last6Months")}</SelectItem>
            <SelectItem value="1y">{t("lastYear")}</SelectItem>
            <SelectItem value="all">{t("allTime")}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="overview">{t("overview")}</TabsTrigger>
          <TabsTrigger value="categories">{t("categories")}</TabsTrigger>
          <TabsTrigger value="trends">{t("trends")}</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <h3 className="text-sm text-muted-foreground mb-1">{t("totalIncome")}</h3>
                <p className="text-3xl font-semibold text-positive">{currency}{income.toFixed(2)}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <h3 className="text-sm text-muted-foreground mb-1">{t("totalExpenses")}</h3>
                <p className="text-3xl font-semibold text-negative">{currency}{expenses.toFixed(2)}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <h3 className="text-sm text-muted-foreground mb-1">{t("savings")}</h3>
                <p className="text-3xl font-semibold">{currency}{savings.toFixed(2)}</p>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4">{t("incomeVsExpenses")}</h3>
              <div className="h-72">
                <CashFlowChart
                  transactions={filteredTransactions}
                  timeRange={timeRange === "3m" ? "monthly" : "monthly"}
                  chartData={incomesExpensesOverTime}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4">{t("spendingByCategory")}</h3>
                <div className="flex justify-center mb-4">
                  <div className="h-64 w-64">
                    <CategoryPieChart categoryData={categoriesWithSpending} />
                  </div>
                </div>
                <div className="space-y-2 mt-4">
                  {categoriesWithSpending.map((category) => (
                    <div key={category.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: category.color }}
                        ></span>
                        <span className="text-sm">{t(`categories.${category.id}`)}</span>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">{currency}{category.amount.toFixed(2)}</span>
                        <span className="text-muted-foreground ml-2">({category.percentage}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4">{t("topExpenseCategories")}</h3>
                <div className="space-y-4">
                  {categoriesWithSpending
                    .sort((a, b) => b.amount - a.amount)
                    .slice(0, 5)
                    .map((category, index) => (
                      <div key={category.id}>
                        <div className="flex justify-between items-center mb-1">
                          <div className="flex items-center">
                            <span className="material-icons text-primary mr-2">{category.icon}</span>
                            <span>{t(`categories.${category.id}`)}</span>
                          </div>
                          <span>{currency}{category.amount.toFixed(2)}</span>
                        </div>
                        <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${category.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                    
                    {categoriesWithSpending.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>{t("noExpensesRecorded")}</p>
                      </div>
                    )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4">{t("monthlyTrends")}</h3>
              <div className="h-72">
                {/* This would be a more complex chart showing expense trends over time */}
                {/* Using the CashFlowChart here as a placeholder */}
                <CashFlowChart
                  transactions={filteredTransactions}
                  timeRange={timeRange === "3m" ? "monthly" : "monthly"}
                  chartData={incomesExpensesOverTime}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4">{t("categoryTrendsOverTime")}</h3>
              <div className="h-72">
                {/* This would be a chart showing category trends over time */}
                {/* Placeholder for now */}
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  {t("categoryTrendsDescription")}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
