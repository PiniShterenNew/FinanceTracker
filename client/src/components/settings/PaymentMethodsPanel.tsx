import { useState } from "react";
import { usePaymentMethods } from "@/hooks/use-payment-methods";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, PlusCircle, CreditCard, Edit, Trash2 } from "lucide-react";
import { useI18n } from "@/components/ui/i18n-provider";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { PAYMENT_METHODS } from "@shared/schema";

// Form schema for payment methods
const paymentMethodSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  type: z.string().min(1, "Please select a payment method type"),
  accountNumber: z.string().optional(),
  bankName: z.string().optional(),
  expiryDate: z.string().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  isDefault: z.boolean().default(false),
});

type PaymentMethodFormValues = z.infer<typeof paymentMethodSchema>;

export function PaymentMethodsPanel() {
  const { t } = useI18n();
  const { paymentMethods, isLoading, createPaymentMethod, updatePaymentMethod, deletePaymentMethod } = usePaymentMethods();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<number | null>(null);

  // Form for adding/editing payment methods
  const form = useForm<PaymentMethodFormValues>({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues: {
      name: "",
      type: "",
      accountNumber: "",
      bankName: "",
      expiryDate: "",
      color: "",
      icon: "",
      isDefault: false,
    },
  });

  // Reset form when dialog is opened
  const handleOpenAddDialog = () => {
    form.reset({
      name: "",
      type: "",
      accountNumber: "",
      bankName: "",
      expiryDate: "",
      color: "",
      icon: "",
      isDefault: false,
    });
    setShowAddDialog(true);
  };

  // Set form values when editing
  const handleOpenEditDialog = (id: number) => {
    const paymentMethod = paymentMethods.find(pm => pm.id === id);
    if (paymentMethod) {
      form.reset({
        name: paymentMethod.name,
        type: paymentMethod.type,
        accountNumber: paymentMethod.accountNumber || "",
        bankName: paymentMethod.bankName || "",
        expiryDate: paymentMethod.expiryDate || "",
        color: paymentMethod.color || "",
        icon: paymentMethod.icon || "",
        isDefault: paymentMethod.isDefault || false,
      });
      setSelectedPaymentMethod(id);
      setShowEditDialog(true);
    }
  };

  // Handle form submission for adding payment method
  const onSubmitAdd = (data: PaymentMethodFormValues) => {
    createPaymentMethod.mutate(data, {
      onSuccess: () => {
        setShowAddDialog(false);
      },
    });
  };

  // Handle form submission for editing payment method
  const onSubmitEdit = (data: PaymentMethodFormValues) => {
    if (selectedPaymentMethod) {
      updatePaymentMethod.mutate({
        id: selectedPaymentMethod,
        ...data,
      }, {
        onSuccess: () => {
          setShowEditDialog(false);
          setSelectedPaymentMethod(null);
        },
      });
    }
  };

  // Handle deletion of payment method
  const handleDelete = () => {
    if (selectedPaymentMethod) {
      deletePaymentMethod.mutate(selectedPaymentMethod, {
        onSuccess: () => {
          setShowDeleteDialog(false);
          setSelectedPaymentMethod(null);
        },
      });
    }
  };

  // Get payment method type name from ID
  const getPaymentMethodTypeName = (typeId: string) => {
    return PAYMENT_METHODS.find(pm => pm.id === typeId)?.name || typeId;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">{t("Payment Methods")}</h3>
        <Button onClick={handleOpenAddDialog} size="sm">
          <PlusCircle className="h-4 w-4 mr-2" />
          {t("Add Method")}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : paymentMethods.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <div className="my-4">
              <CreditCard className="h-10 w-10 mx-auto text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">{t("No Payment Methods")}</h3>
            <p className="text-sm text-muted-foreground mt-2">
              {t("Add payment methods to easily track your expenses")}
            </p>
            <Button onClick={handleOpenAddDialog} className="mt-4">
              <PlusCircle className="h-4 w-4 mr-2" />
              {t("Add Your First Payment Method")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {paymentMethods.map((method) => (
            <Card key={method.id} className={method.isDefault ? "border-primary" : ""}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{method.name}</CardTitle>
                    <CardDescription>{getPaymentMethodTypeName(method.type)}</CardDescription>
                  </div>
                  {method.isDefault && (
                    <div className="px-2 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
                      {t("Default")}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                {method.accountNumber && (
                  <p className="text-sm">
                    <span className="font-medium">{t("Account")}:</span>{" "}
                    {method.accountNumber.replace(/\d(?=\d{4})/g, "*")}
                  </p>
                )}
                {method.bankName && (
                  <p className="text-sm">
                    <span className="font-medium">{t("Bank")}:</span> {method.bankName}
                  </p>
                )}
                {method.expiryDate && (
                  <p className="text-sm">
                    <span className="font-medium">{t("Expires")}:</span> {method.expiryDate}
                  </p>
                )}
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedPaymentMethod(method.id);
                    setShowDeleteDialog(true);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  {t("Delete")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenEditDialog(method.id)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  {t("Edit")}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Add Payment Method Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("Add Payment Method")}</DialogTitle>
            <DialogDescription>
              {t("Add a new payment method to track your expenses")}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitAdd)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Name")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("My Credit Card")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Type")}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("Select type")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PAYMENT_METHODS.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {t(type.name)}
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
                name="accountNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Account Number")}</FormLabel>
                    <FormControl>
                      <Input placeholder="XXXX XXXX XXXX XXXX" {...field} />
                    </FormControl>
                    <FormDescription>
                      {t("Optional - Last 4 digits will be visible")}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="bankName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Bank Name")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("Bank name")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="expiryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Expiry Date")}</FormLabel>
                      <FormControl>
                        <Input placeholder="MM/YY" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="isDefault"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>{t("Set as default")}</FormLabel>
                      <FormDescription>
                        {t("Use this payment method by default for new transactions")}
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={createPaymentMethod.isPending}>
                  {createPaymentMethod.isPending && (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  )}
                  {t("Add Payment Method")}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Payment Method Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("Edit Payment Method")}</DialogTitle>
            <DialogDescription>
              {t("Update your payment method details")}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitEdit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Name")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("My Credit Card")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Type")}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("Select type")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PAYMENT_METHODS.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {t(type.name)}
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
                name="accountNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Account Number")}</FormLabel>
                    <FormControl>
                      <Input placeholder="XXXX XXXX XXXX XXXX" {...field} />
                    </FormControl>
                    <FormDescription>
                      {t("Optional - Last 4 digits will be visible")}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="bankName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Bank Name")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("Bank name")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="expiryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Expiry Date")}</FormLabel>
                      <FormControl>
                        <Input placeholder="MM/YY" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="isDefault"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>{t("Set as default")}</FormLabel>
                      <FormDescription>
                        {t("Use this payment method by default for new transactions")}
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={updatePaymentMethod.isPending}>
                  {updatePaymentMethod.isPending && (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  )}
                  {t("Update Payment Method")}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Payment Method Alert Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("Delete Payment Method")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("Are you sure you want to delete this payment method? This action cannot be undone.")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("Cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deletePaymentMethod.isPending}>
              {deletePaymentMethod.isPending && (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              )}
              {t("Delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}