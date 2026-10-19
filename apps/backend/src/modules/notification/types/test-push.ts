export type TestPush = {
  token: string;
};

export type FcmError = {
  message?: string;
  code?: string;
};

export type TestPushResult = {
  ok: boolean;
  firebase: boolean;
  messageId?: string;
  error?: string;
  code?: string;
};
