import { useQuery } from "@tanstack/react-query";
import { getPayment, getPayments } from "../../lib/api/payments";
import type { PaymentQuery } from "../../lib/types/payments";

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
