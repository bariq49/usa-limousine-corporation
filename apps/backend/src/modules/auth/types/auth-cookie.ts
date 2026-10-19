import type { Response } from "express";
import type { AuthCookieEnv, AuthCookieSameSite } from "../../../config/env";

export type CookieAction = "set" | "clear";

export type CookieOptions = {
  httpOnly: boolean;
  secure: boolean;
  sameSite: AuthCookieSameSite;
  path: string;
  domain?: string | undefined;
};

export type ApplyCookieParams = {
  action: CookieAction;
  response: Response;
  cookie: AuthCookieEnv;
  data: unknown;
};

export type SessionTokens = {
  accessToken: string;
  sessionId: string;
  refreshToken: string;
  refreshExpiresAt: Date;
};
