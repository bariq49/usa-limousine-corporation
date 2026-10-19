export interface IssueSessionTokens {
  userId: string;
  email: string;
  deviceId: string;
  ipAddress: string | null;
  userAgent: string | null;
  rememberMe: boolean;
}
