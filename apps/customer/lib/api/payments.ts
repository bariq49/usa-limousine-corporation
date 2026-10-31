import { http } from "../http/client";
import API_ROUTES from "./routes";
import type {
  Payment,
  PaymentListResponse,
  PaymentQuery,
  Refund,
  RefundListResponse,
  RefundQuery,
} from "../types/payments";

export const getPayments = (params?: PaymentQuery) => {
  return http.get<PaymentListResponse>(API_ROUTES.PAYMENTS, { params });
};

export const getPayment = (id: string) => {
  return http.get<Payment>(`${API_ROUTES.PAYMENTS}/${id}`);
};

export const getRefunds = (params?: RefundQuery) => {
  return http.get<RefundListResponse>(API_ROUTES.REFUNDS, { params });
};

export const getRefund = (id: string) => {
  return http.get<Refund>(`${API_ROUTES.REFUNDS}/${id}`);
};
