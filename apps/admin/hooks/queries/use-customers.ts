import { useQuery } from "@tanstack/react-query";
import { getCustomer, getCustomers } from "../../lib/api/customers";
import type { CustomerQuery } from "../../lib/types/customers";

export const customerKeys = {
  list: (params?: CustomerQuery) => ["customers", "list", params] as const,
  detail: (id: string) => ["customers", "detail", id] as const,
};

export const useCustomers = (params?: CustomerQuery) => {
  return useQuery({
    queryKey: customerKeys.list(params),
    queryFn: () => getCustomers(params),
  });
};

export const useCustomer = (id: string) => {
  return useQuery({
    queryKey: customerKeys.detail(id),
    queryFn: () => getCustomer(id),
    enabled: Boolean(id),
  });
};
