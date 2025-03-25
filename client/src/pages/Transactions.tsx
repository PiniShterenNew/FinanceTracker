import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppContext } from "@/context/AppContext";
import TransactionItem from "@/components/TransactionItem";
import { formatDate, groupTransactionsByDate } from "@/lib/utils";
import { TransactionData } from "@shared/schema";
import { CATEGORIES } from "@shared/schema";
import NewTransactionModal from "@/components/NewTransactionModal";

const Transactions: React.FC = () => {
  const { t } = useTranslation();
  const { transactions, currency, setIsNewTransactionModalOpen } = useAppContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("date-desc");
  
  // Filter and sort transactions
  const filteredTransactions = transactions.filter((transaction) => {
    // Search query
    const searchMatch = !searchQuery || 
      transaction.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Category filter
    const categoryMatch = !categoryFilter || transaction.category === categoryFilter;
    
    // Type filter
    const typeMatch = !typeFilter || transaction.type === typeFilter;
    
    return searchMatch && categoryMatch && typeMatch;
  });
  
  // Sort transactions
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    switch (sortBy) {
      case "date-asc":
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case "date-desc":
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case "amount-asc":
        return a.amount - b.amount;
      case "amount-desc":
        return b.amount - a.amount;
      default:
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
  });
  
  // Group transactions by date
  const groupedTransactions = groupTransactionsByDate(sortedTransactions);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">{t("transactions")}</h2>
        <Button 
          onClick={() => setIsNewTransactionModalOpen(true)}
          className="px-3 py-1.5"
          size="sm"
        >
          <span className="material-icons text-sm mr-1">add</span>
          <span>{t("addTransaction")}</span>
        </Button>
      </div>
      
      {/* Filters and search */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Input
                placeholder={t("search")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={t("category")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t("allCategories")}</SelectItem>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {t(`categories.${category.id}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={t("type")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t("allTypes")}</SelectItem>
                  <SelectItem value="expense">{t("expense")}</SelectItem>
                  <SelectItem value="income">{t("income")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder={t("sortBy")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">{t("mostRecent")}</SelectItem>
                  <SelectItem value="date-asc">{t("oldest")}</SelectItem>
                  <SelectItem value="amount-desc">{t("highestAmount")}</SelectItem>
                  <SelectItem value="amount-asc">{t("lowestAmount")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Transactions list */}
      {Object.keys(groupedTransactions).length > 0 ? (
        Object.entries(groupedTransactions).map(([date, dateTransactions]) => (
          <Card key={date} className="overflow-hidden">
            <div className="bg-muted px-4 py-2 font-medium">
              {formatDate(date)}
            </div>
            <CardContent className="p-0">
              <div className="divide-y">
                {dateTransactions.map((transaction: TransactionData) => (
                  <div key={transaction.localId} className="p-4">
                    <TransactionItem 
                      transaction={transaction}
                      currency={currency}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-muted-foreground mb-4">
              <span className="material-icons text-4xl">receipt_long</span>
              <h3 className="mt-2 font-semibold">{t("noTransactionsFound")}</h3>
            </div>
            <Button onClick={() => setIsNewTransactionModalOpen(true)}>
              {t("addTransaction")}
            </Button>
          </CardContent>
        </Card>
      )}
      
      <NewTransactionModal />
    </div>
  );
};

export default Transactions;
