export type BookingNotifyInput = {
  bookingId: string;
  bookingNumber: string;
  userId?: string | null | undefined;
  excludeUserId?: string | null | undefined;
  notifyAdmins?: boolean | undefined;
  byCustomer?: boolean | undefined;
  customerName?: string | null | undefined;
  reason?: string | null | undefined;
};
