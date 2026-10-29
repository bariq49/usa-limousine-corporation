import type { BookingEmail } from "../../../infrastructure/email/types/booking";

export type EmailContext = {
  siteUrl: string;
  reviewUrl?: string | undefined;
};

export type ContactPreferences = {
  email: boolean;
  sms: boolean;
};

export type BookingEmailProps = {
  bookingId: string;
};

export type CancelEmailProps = {
  bookingId: string;
  reason: string | null;
  refundAmount: number;
  byCustomer: boolean;
};

export type DeliverProps = {
  bookingId: string;
  kind: string;
  send: (props: DeliverSendProps) => Promise<unknown>;
};

export type DeliverSendProps = {
  booking: BookingEmail;
  context: EmailContext;
  prefs: ContactPreferences;
};

export type CustomerMailProps = {
  booking: BookingEmail;
  prefs: ContactPreferences;
  subject: string;
  html: string;
};

export type AdminMailProps = {
  booking: BookingEmail;
  subject: string;
  html: string;
};
