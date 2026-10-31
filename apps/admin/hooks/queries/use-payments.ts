import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getPayment, getPayments, refundPayment } from "../../lib/api/payments";
import type { PaymentQuery, RefundInput } from "../../lib/types/payments";

export const paymentKeys = {
  all: ["payments"] as const,
  list: (params?: PaymentQuery) => ["payments", "list", params] as const,
  detail: (id: string) => ["payments", "detail", id] as const,
};

export const usePayments = (params?: PaymentQuery) => {
  return useQuery({
    queryKey: paymentKeys.list(params),
    queryFn: () => getPayments(params),
  });
};

export const usePayment = (id: string) => {
  return useQuery({
    queryKey: paymentKeys.detail(id),
    queryFn: () => getPayment(id),
    enabled: Boolean(id),
  });
};

export const useRefundPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: RefundInput }) => refundPayment(id, input),
    onSuccess: () => {
      toast.success("Refund processed successfully");
      return queryClient.invalidateQueries({ queryKey: paymentKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to process refund");
    },
  });
};
