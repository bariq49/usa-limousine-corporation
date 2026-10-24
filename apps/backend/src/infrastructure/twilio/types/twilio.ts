export type Config = {
  sid?: string;
  token?: string;
  /** Alphanumeric sender ID shown as the SMS sender instead of a phone number. */
  from?: string;
};

export type Message = {
  to: string;
  body: string;
};

export type Result = {
  sid: string;
  status: string;
  to: string;
  from: string;
};
