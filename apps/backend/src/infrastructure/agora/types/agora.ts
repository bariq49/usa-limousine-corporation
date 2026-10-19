export type Config = {
  appId?: string;
  appCertificate?: string;
  tokenTtlSeconds: number;
};

export type RtcRoleName = "publisher" | "subscriber";

export type RtcTokenInput = {
  channel: string;
  uid: number;
  role?: RtcRoleName;
  ttlSeconds?: number;
};

export type RtcTokenResult = {
  appId: string;
  channel: string;
  uid: number;
  token: string;
  role: RtcRoleName;
  expiresAt: Date;
};
