import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { completeRefund, getRefund, getRefunds, rejectRefund } from "../../lib/api/payments";
import type { CompleteRefundInput, RefundQuery, RejectRefundInput } from "../../lib/types/payments";
import { paymentKeys } from "./use-payments";

export const refundKeys = {
  all: ["refunds"] as const,
  list: (params?: RefundQuery) => ["refunds", "list", params] as const,
  detail: (id: string) => ["refunds", "detail", id] as const,
};

export const useRefunds = (params?: RefundQuery) => {
  return useQuery({
    queryKey: refundKeys.list(params),
    queryFn: () => getRefunds(params),
  });
};

export const useRefund = (id: string) => {
  return useQuery({
    queryKey: refundKeys.detail(id),
    queryFn: () => getRefund(id),
    enabled: Boolean(id),
  });
};

export const useCompleteRefund = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input?: CompleteRefundInput }) =>
      completeRefund(id, input),
    onSuccess: () => {
      toast.success("Refund completed successfully");
      void queryClient.invalidateQueries({ queryKey: refundKeys.all });
      void queryClient.invalidateQueries({ queryKey: paymentKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to complete refund");
    },
  });
};

export const useRejectRefund = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input?: RejectRefundInput }) =>
      rejectRefund(id, input),
    onSuccess: () => {
      toast.success("Refund rejected");
      void queryClient.invalidateQueries({ queryKey: refundKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to reject refund");
    },
  });
};
