import type { Response } from "express";
import type { CsrfCookieEnv } from "../../../config/env";

export function applyCsrfCookie(params: {
  response: Response;
  cookie: CsrfCookieEnv;
  token: string;
}): void {
  const { response, cookie, token } = params;
  const options = {
    httpOnly: cookie.httpOnly,
    secure: cookie.secure,
    sameSite: cookie.sameSite,
    path: cookie.path,
    maxAge: cookie.maxAgeSeconds * 1000,
    ...(cookie.domain ? { domain: cookie.domain } : {}),
  };

  response.cookie(cookie.name, token, options);
}
