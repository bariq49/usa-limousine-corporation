export type Config = {
  sid?: string;
  token?: string;
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
