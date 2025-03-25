import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppContext } from "@/context/AppContext";
import BudgetProgressItem from "@/components/BudgetProgressItem";
import { CATEGORIES } from "@shared/schema";
import { BudgetData } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { startOfMonth, endOfMonth, format } from "date-fns";

const budgetFormSchema = z.object({
  category: z.string().min(1, "Category is required"),
  amount: z.coerce.number().positive("Amount must be positive"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
});

type BudgetFormValues = z.infer<typeof budgetFormSchema>;

const Budgets: React.FC = () => {
  const { t } = useTranslation();
  const { budgets, addBudget, updateBudget, deleteBudget, transactions, currency } = useAppContext();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<BudgetData | null>(null);
  
  // Initialize form
  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: {
      category: "",
      amount: 0,
      startDate: format(startOfMonth(new Date()), "yyyy-MM-dd"),
      endDate: format(endOfMonth(new Date()), "yyyy-MM-dd"),
    },
  });
  
  const openNewBudgetDialog = () => {
    form.reset({
      category: "",
      amount: 0,
      startDate: format(startOfMonth(new Date()), "yyyy-MM-dd"),
      endDate: format(endOfMonth(new Date()), "yyyy-MM-dd"),
    });
    setEditingBudget(null);
    setIsDialogOpen(true);
  };
  
  const openEditBudgetDialog = (budget: BudgetData) => {
    form.reset({
      category: budget.category,
      amount: budget.amount,
      startDate: format(new Date(budget.startDate), "yyyy-MM-dd"),
      endDate: format(new Date(budget.endDate), "yyyy-MM-dd"),
    });
    setEditingBudget(budget);
    setIsDialogOpen(true);
  };
  
  const onSubmit = (data: BudgetFormValues) => {
    const budgetData: BudgetData = {
      category: data.category,
      amount: data.amount,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
    };
    
    if (editingBudget) {
      updateBudget(editingBudget.localId!, budgetData);
    } else {
      addBudget(budgetData);
    }
    
    setIsDialogOpen(false);
  };
  
  const handleDeleteBudget = () => {
    if (editingBudget) {
      deleteBudget(editingBudget.localId!);
      setIsDialogOpen(false);
    }
  };
  
  // Group budgets by active/inactive
  const now = new Date();
  const activeBudgets = budgets.filter(budget => 
    new Date(budget.startDate) <= now && new Date(budget.endDate) >= now
  );
  
  const inactiveBudgets = budgets.filter(budget => 
    new Date(budget.startDate) > now || new Date(budget.endDate) < now
  );
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">{t("budgets")}</h2>
        <Button onClick={openNewBudgetDialog}>
          <span className="material-icons text-sm mr-1">add</span>
          <span>{t("createBudget")}</span>
        </Button>
      </div>
      
      {/* Active Budgets */}
      <div>
        <h3 className="text-lg font-medium mb-4">{t("activeBudgets")}</h3>
        {activeBudgets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeBudgets.map((budget) => (
              <Card key={budget.localId} className="overflow-hidden">
                <CardContent className="p-4">
                  <BudgetProgressItem 
                    budget={budget}
                    transactions={transactions}
                    currency={currency}
                  />
                  <div className="mt-4 flex justify-end space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openEditBudgetDialog(budget)}
                    >
                      {t("edit")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-muted-foreground mb-4">
                <span className="material-icons text-4xl">account_balance</span>
                <h3 className="mt-2 font-semibold">{t("noBudgets")}</h3>
                <p className="mt-1 text-sm">{t("createBudgetToTrack")}</p>
              </div>
              <Button onClick={openNewBudgetDialog}>
                {t("createBudget")}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Inactive Budgets */}
      {inactiveBudgets.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-4">{t("inactiveBudgets")}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {inactiveBudgets.map((budget) => (
              <Card key={budget.localId} className="overflow-hidden opacity-70">
                <CardContent className="p-4">
                  <BudgetProgressItem 
                    budget={budget}
                    transactions={transactions}
                    currency={currency}
                  />
                  <div className="mt-4 flex justify-end space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openEditBudgetDialog(budget)}
                    >
                      {t("edit")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      {/* Budget Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingBudget ? t("editBudget") : t("createBudget")}
            </DialogTitle>
            <DialogDescription>
              {t("budgetDialogDescription")}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("category")}</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("selectCategory")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CATEGORIES.filter(cat => cat.id !== "income").map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {t(`categories.${category.id}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("amount")}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-muted-foreground">{currency}</span>
                        </div>
                        <Input 
                          type="number" 
                          className="pl-7" 
                          step="0.01"
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("startDate")}</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("endDate")}</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter className="gap-2 sm:gap-0">
                {editingBudget && (
                  <Button 
                    type="button" 
                    variant="destructive"
                    onClick={handleDeleteBudget}
                  >
                    {t("delete")}
                  </Button>
                )}
                <Button type="submit">
                  {editingBudget ? t("update") : t("create")}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Budgets;
