export type PaymentStatus = "PAID" | "REFUNDED" | "CANCELLED";
export type PaymentMode = "TEST" | "LIVE";

export type PaymentBooking = {
  id: string;
  bookingNumber: string;
  status: string;
  bookingType: string;
  totalPrice: number;
  userId: string | null;
};

export type Payment = {
  id: string;
  bookingId: string;
  status: PaymentStatus;
  mode: PaymentMode;
  amount: number;
  currency: string;
  transactionId: string | null;
  squarePaymentId: string | null;
  squareOrderId: string;
  cardBrand: string | null;
  cardLast4: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  paidAt: string | null;
  refundedAmount: number | null;
  refundedAt: string | null;
  squareRefundId: string | null;
  createdAt: string;
  updatedAt: string;
  booking?: PaymentBooking | null;
};

export type PaymentQuery = {
  page?: number | undefined;
  limit?: number | undefined;
  search?: string | undefined;
  status?: PaymentStatus | undefined;
  mode?: PaymentMode | undefined;
};

export type PaymentListResponse = {
  data: Payment[];
  total: number;
  page: number;
  limit: number;
  pages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export type RefundInput = {
  amount?: number | undefined;
  reason?: string | undefined;
  manual?: boolean | undefined;
};

export type RefundStatus = "PENDING" | "COMPLETED" | "REJECTED" | "FAILED";

export type RefundPayment = {
  id: string;
  transactionId: string | null;
  amount: number;
  currency: string;
  mode: PaymentMode;
  status: PaymentStatus;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  cardBrand: string | null;
  cardLast4: string | null;
  squarePaymentId: string | null;
  refundedAmount: number | null;
};

export type Refund = {
  id: string;
  refundNumber?: string | null;
  bookingId: string;
  paymentId: string;
  amount: number;
  status: RefundStatus;
  reason: string | null;
  isManual: boolean;
  squareRefundId: string | null;
  processedAt: string | null;
  processedBy: string | null;
  createdAt: string;
  updatedAt: string;
  booking?: PaymentBooking | null;
  payment?: RefundPayment | null;
};

export type RefundQuery = {
  page?: number | undefined;
  limit?: number | undefined;
  search?: string | undefined;
  status?: RefundStatus | undefined;
};

export type RefundListResponse = {
  data: Refund[];
  total: number;
  page: number;
  limit: number;
  pages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export type CompleteRefundInput = {
  manual?: boolean | undefined;
  reason?: string | undefined;
};

export type RejectRefundInput = {
  reason?: string | undefined;
};
