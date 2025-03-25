import { useMutation, useQuery } from "@tanstack/react-query";
import { PaymentMethod, InsertPaymentMethod } from "@shared/schema";
import { apiRequest, queryClient, getQueryFn } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export const usePaymentMethods = () => {
  const { toast } = useToast();
  
  // Fetch all payment methods
  const {
    data: paymentMethods = [],
    isLoading,
    error,
    refetch,
  } = useQuery<PaymentMethod[]>({
    queryKey: ["/api/payment-methods"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  // Create a new payment method
  const createPaymentMethod = useMutation({
    mutationFn: async (data: Omit<InsertPaymentMethod, "userId">) => {
      const res = await apiRequest("POST", "/api/payment-methods", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payment-methods"] });
      toast({
        title: "Payment method added",
        description: "Your payment method has been added successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add payment method",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update an existing payment method
  const updatePaymentMethod = useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Partial<Omit<InsertPaymentMethod, "userId">>) => {
      const res = await apiRequest("PUT", `/api/payment-methods/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payment-methods"] });
      toast({
        title: "Payment method updated",
        description: "Your payment method has been updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update payment method",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete a payment method
  const deletePaymentMethod = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/payment-methods/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payment-methods"] });
      toast({
        title: "Payment method deleted",
        description: "Your payment method has been deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete payment method",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Get payment method by ID
  const getPaymentMethod = (id?: number | string) => {
    if (!id) return null;
    return paymentMethods.find(pm => pm.id === Number(id)) || null;
  };

  return {
    paymentMethods,
    isLoading,
    error,
    refetch,
    createPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    getPaymentMethod,
  };
};