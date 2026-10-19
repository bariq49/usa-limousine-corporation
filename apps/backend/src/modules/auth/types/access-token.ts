export interface AccessTokenPayload {
  sub: string;
  sid: string;
  email: string;
  rm?: boolean;
}

export interface SignAccessToken {
  sub: string;
  email: string;
  sid: string;
  rememberMe: boolean;
  accessTtl: number;
}
