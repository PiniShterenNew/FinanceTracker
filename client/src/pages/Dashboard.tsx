import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "@/context/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BudgetProgressItem from "@/components/BudgetProgressItem";
import TransactionItem from "@/components/TransactionItem";
import CashFlowChart from "@/components/charts/CashFlowChart";
import CategoryPieChart from "@/components/charts/CategoryPieChart";
import NewTransactionModal from "@/components/NewTransactionModal";
import { getCategoriesWithSpending, getMonthlyStats, getRecentTransactions } from "@/lib/utils";

type TimeRange = "daily" | "weekly" | "monthly";

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const { transactions, budgets, setIsNewTransactionModalOpen, currency } = useAppContext();
  const [timeRange, setTimeRange] = useState<TimeRange>("daily");
  
  // Get monthly stats
  const { income, expenses, remaining, savings } = getMonthlyStats(transactions);
  
  // Get budget progress data
  const budgetCategories = budgets
    .filter(budget => {
      const now = new Date();
      return new Date(budget.startDate) <= now && new Date(budget.endDate) >= now;
    })
    .map(budget => budget.category);
  
  // Get recent transactions
  const recentTransactions = getRecentTransactions(transactions, 4);
  
  // Get spending by category
  const categoriesWithSpending = getCategoriesWithSpending(transactions);
  
  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">{t("dashboard")}</h2>
        <div className="flex space-x-2">
          <Button 
            onClick={() => setIsNewTransactionModalOpen(true)} 
            className="px-3 py-1.5"
            size="sm"
          >
            <span className="material-icons text-sm mr-1">add</span>
            <span>{t("new")}</span>
          </Button>
        </div>
      </div>
      
      {/* Quick Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">{t("stats.thisMonth")}</p>
                <h3 className="text-xl font-semibold text-positive">+{currency}{income.toFixed(2)}</h3>
              </div>
              <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <span className="material-icons text-positive">trending_up</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">{t("stats.expenses")}</p>
                <h3 className="text-xl font-semibold text-negative">-{currency}{expenses.toFixed(2)}</h3>
              </div>
              <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <span className="material-icons text-negative">trending_down</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">{t("stats.remaining")}</p>
                <h3 className="text-xl font-semibold">{currency}{remaining.toFixed(2)}</h3>
              </div>
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <span className="material-icons text-primary">account_balance</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">{t("stats.savings")}</p>
                <h3 className="text-xl font-semibold">{currency}{savings.toFixed(2)}</h3>
              </div>
              <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <span className="material-icons text-purple-500">savings</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Budget Progress & Cash Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Budget Cards */}
        <Card className="lg:col-span-1">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">{t("budgetProgress")}</h3>
              <Button variant="link" className="text-primary text-sm h-auto p-0">
                {t("viewAll")}
              </Button>
            </div>
            
            <div className="space-y-4">
              {budgets.slice(0, 4).map((budget) => (
                <BudgetProgressItem 
                  key={budget.localId}
                  budget={budget}
                  transactions={transactions}
                  currency={currency}
                />
              ))}
              
              {budgets.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  <p>{t("noBudgets")}</p>
                  <Button variant="link" className="mt-2">
                    {t("createBudget")}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Cash Flow Chart */}
        <Card className="lg:col-span-2">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">{t("cashFlow")}</h3>
              <div className="flex space-x-2">
                <Button
                  variant={timeRange === "daily" ? "default" : "ghost"}
                  onClick={() => setTimeRange("daily")}
                  className="px-2 py-1 h-auto text-xs"
                >
                  {t("daily")}
                </Button>
                <Button
                  variant={timeRange === "weekly" ? "default" : "ghost"}
                  onClick={() => setTimeRange("weekly")}
                  className="px-2 py-1 h-auto text-xs"
                >
                  {t("weekly")}
                </Button>
                <Button
                  variant={timeRange === "monthly" ? "default" : "ghost"}
                  onClick={() => setTimeRange("monthly")}
                  className="px-2 py-1 h-auto text-xs"
                >
                  {t("monthly")}
                </Button>
              </div>
            </div>
            
            <div className="h-64 relative">
              <CashFlowChart transactions={transactions} timeRange={timeRange} />
            </div>
            
            <div className="flex justify-center space-x-8 mt-2">
              <div className="flex items-center">
                <span className="w-3 h-3 bg-primary rounded-full mr-2"></span>
                <span className="text-sm text-muted-foreground">{t("income")}</span>
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 bg-negative rounded-full mr-2"></span>
                <span className="text-sm text-muted-foreground">{t("expenses")}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Transactions & Category Spending */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <Card className="lg:col-span-2">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">{t("recentTransactions")}</h3>
              <Button variant="link" className="text-primary text-sm h-auto p-0">
                {t("viewAll")}
              </Button>
            </div>
            
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <TransactionItem 
                  key={transaction.localId}
                  transaction={transaction}
                  currency={currency}
                />
              ))}
              
              {recentTransactions.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  <p>{t("noTransactions")}</p>
                  <Button 
                    variant="link" 
                    className="mt-2"
                    onClick={() => setIsNewTransactionModalOpen(true)}
                  >
                    {t("addTransaction")}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Category Spending */}
        <Card className="lg:col-span-1">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">{t("categorySpending")}</h3>
              <Button variant="link" className="text-primary text-sm h-auto p-0">
                {t("details")}
              </Button>
            </div>
            
            <div className="h-52 relative">
              <CategoryPieChart categoryData={categoriesWithSpending} />
            </div>
            
            <div className="space-y-2 mt-4">
              {categoriesWithSpending.map((category, index) => (
                <div key={category.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: category.color }}
                    ></span>
                    <span className="text-sm">{t(`categories.${category.id}`)}</span>
                  </div>
                  <span className="text-sm font-medium">{category.percentage}%</span>
                </div>
              ))}
              
              {categoriesWithSpending.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  <p>{t("noExpenses")}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <NewTransactionModal />
    </div>
  );
};

export default Dashboard;
