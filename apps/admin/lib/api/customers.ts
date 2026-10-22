import { http } from "../http/client";
import API_ROUTES from "./routes";
import type { CustomerDetail, CustomerListResponse, CustomerQuery } from "../types/customers";

export const getCustomers = (params?: CustomerQuery) => {
  return http.get<CustomerListResponse>(API_ROUTES.CUSTOMERS, { params });
};

export const getCustomer = (id: string) => {
  return http.get<CustomerDetail>(`${API_ROUTES.CUSTOMERS}/${id}`);
};
