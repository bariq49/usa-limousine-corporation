export interface RefreshTokenPayload {
  sub: string;
  sid: string;
  email: string;
  jti?: string;
  rm?: boolean;
}
