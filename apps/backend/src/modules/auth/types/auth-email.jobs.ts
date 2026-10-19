export type Channel = "email" | "sms";

export type SendVerification = {
  userId: string;
  email: string;
  phone?: string | null;
  channel?: Channel;
};

export type SendPasswordReset = {
  userId: string;
  email: string;
  phone?: string | null;
  channel?: Channel;
};

export type SmsPayload = {
  to: string;
  token: string;
  expiresInMinutes: number;
};
