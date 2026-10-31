import { useQuery } from "@tanstack/react-query";
import { getRefund, getRefunds } from "../../lib/api/payments";
import type { RefundQuery } from "../../lib/types/payments";

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
