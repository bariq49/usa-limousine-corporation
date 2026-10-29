export type Verification = {
  to: string;
  token: string;
  expiresInMinutes?: number | undefined;
};

export type PasswordReset = {
  to: string;
  token: string;
  expiresInMinutes?: number | undefined;
};
