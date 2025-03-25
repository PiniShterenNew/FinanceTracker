import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "@/context/AppContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES } from "@shared/schema";
import { format } from "date-fns";
import { TransactionData } from "@shared/schema";

const NewTransactionModal: React.FC = () => {
  const { t } = useTranslation();
  const { isNewTransactionModalOpen, setIsNewTransactionModalOpen, addTransaction, currency } = useAppContext();
  
  // Form state
  const [type, setType] = useState<"expense" | "income">("expense");
  const [amount, setAmount] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [date, setDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  
  // Clear form when modal closes
  useEffect(() => {
    if (!isNewTransactionModalOpen) {
      resetForm();
    }
  }, [isNewTransactionModalOpen]);
  
  const resetForm = () => {
    setType("expense");
    setAmount("");
    setCategory("");
    setDescription("");
    setDate(format(new Date(), "yyyy-MM-dd"));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !category || !date) {
      return;
    }
    
    const parsedAmount = parseFloat(amount);
    
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return;
    }
    
    const transaction: TransactionData = {
      amount: type === "expense" ? -parsedAmount : parsedAmount,
      type,
      category,
      description,
      date: new Date(date),
      syncStatus: "pending",
    };
    
    addTransaction(transaction);
    setIsNewTransactionModalOpen(false);
  };
  
  // Filter categories based on transaction type
  const filteredCategories = CATEGORIES.filter(cat => 
    type === "expense" ? cat.id !== "income" : cat.id === "income"
  );
  
  return (
    <Dialog open={isNewTransactionModalOpen} onOpenChange={setIsNewTransactionModalOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("newTransaction")}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="flex mb-4 border-b border-neutral-200 dark:border-neutral-700">
            <Button
              type="button"
              variant={type === "expense" ? "default" : "ghost"}
              className={`w-1/2 py-2 text-center ${
                type === "expense" ? "border-b-2 border-primary" : ""
              }`}
              onClick={() => setType("expense")}
            >
              {t("expense")}
            </Button>
            <Button
              type="button"
              variant={type === "income" ? "default" : "ghost"}
              className={`w-1/2 py-2 text-center ${
                type === "income" ? "border-b-2 border-primary" : ""
              }`}
              onClick={() => setType("income")}
            >
              {t("income")}
            </Button>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="amount">{t("amount")}</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-muted-foreground">{currency}</span>
                </div>
                <Input
                  id="amount"
                  type="number"
                  className="pl-8"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="category">{t("category")}</Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger>
                  <SelectValue placeholder={t("selectCategory")} />
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <div className="flex items-center">
                        <span className="material-icons mr-2 text-sm">{cat.icon}</span>
                        <span>{t(`categories.${cat.id}`)}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="description">{t("description")}</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("descriptionPlaceholder")}
              />
            </div>
            
            <div>
              <Label htmlFor="date">{t("date")}</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>
          
          <DialogFooter className="mt-4">
            <Button type="submit">
              {t("addTransaction")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewTransactionModal;
