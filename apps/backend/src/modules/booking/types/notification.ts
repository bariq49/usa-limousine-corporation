export type BookingNotifyInput = {
  bookingId: string;
  bookingNumber: string;
  excludeUserId?: string | null;
  customerUserId?: string | null;
  notifyAdmins?: boolean;
};
