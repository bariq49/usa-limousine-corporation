export interface PasswordReset {
  to: string;
  token: string;
  expiresInMinutes?: number;
}
