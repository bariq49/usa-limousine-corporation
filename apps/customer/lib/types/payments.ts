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
  cardBrand: string | null;
  cardLast4: string | null;
  paidAt: string | null;
  refundedAmount: number | null;
  refundedAt: string | null;
  createdAt: string;
  booking?: PaymentBooking | null;
};

export type PaymentQuery = {
  page?: number | undefined;
  limit?: number | undefined;
  search?: string | undefined;
  status?: PaymentStatus | undefined;
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

export type RefundStatus = "PENDING" | "COMPLETED" | "REJECTED" | "FAILED";

export type Refund = {
  id: string;
  bookingId: string;
  paymentId: string;
  amount: number;
  status: RefundStatus;
  reason: string | null;
  isManual: boolean;
  squareRefundId: string | null;
  processedAt: string | null;
  createdAt: string;
  booking?: PaymentBooking | null;
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
