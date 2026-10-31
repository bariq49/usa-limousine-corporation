import { http } from "../http/client";
import API_ROUTES from "./routes";
import type {
  CompleteRefundInput,
  Payment,
  PaymentListResponse,
  PaymentQuery,
  Refund,
  RefundInput,
  RefundListResponse,
  RefundQuery,
  RejectRefundInput,
} from "../types/payments";

export const getPayments = (params?: PaymentQuery) => {
  return http.get<PaymentListResponse>(API_ROUTES.PAYMENTS, { params });
};

export const getPayment = (id: string) => {
  return http.get<Payment>(`${API_ROUTES.PAYMENTS}/${id}`);
};

export const refundPayment = (id: string, body: RefundInput) => {
  return http.post<Payment>(`${API_ROUTES.PAYMENTS}/${id}/refund`, body);
};

export const getRefunds = (params?: RefundQuery) => {
  return http.get<RefundListResponse>(API_ROUTES.REFUNDS, { params });
};

export const getRefund = (id: string) => {
  return http.get<Refund>(`${API_ROUTES.REFUNDS}/${id}`);
};

export const completeRefund = (id: string, body?: CompleteRefundInput) => {
  return http.post<Refund>(`${API_ROUTES.REFUNDS}/${id}/complete`, body || {});
};

export const rejectRefund = (id: string, body?: RejectRefundInput) => {
  return http.post<Refund>(`${API_ROUTES.REFUNDS}/${id}/reject`, body || {});
};
