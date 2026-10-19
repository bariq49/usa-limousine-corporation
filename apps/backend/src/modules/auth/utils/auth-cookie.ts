import type { ApplyCookieParams, CookieOptions, SessionTokens } from "../types/auth-cookie";

export function applyAuthCookie(params: ApplyCookieParams): unknown {
  const { action, response, cookie, data } = params;

  const options: CookieOptions = {
    httpOnly: cookie.httpOnly,
    secure: cookie.secure,
    sameSite: cookie.sameSite,
    path: cookie.path,
  };

  if (cookie.domain) {
    options.domain = cookie.domain;
  }

  if (action === "clear") {
    response.clearCookie(cookie.name, options);
    return data;
  }

  const { accessToken, sessionId, refreshToken, refreshExpiresAt } = data as SessionTokens;
  const maxAgeMs = Math.min(
    Math.max(0, refreshExpiresAt.getTime() - Date.now()),
    10 * 365 * 24 * 60 * 60 * 1000,
  );

  response.cookie(cookie.name, refreshToken, {
    httpOnly: options.httpOnly,
    secure: options.secure,
    sameSite: options.sameSite,
    path: options.path,
    domain: options.domain,
    expires: refreshExpiresAt,
    maxAge: maxAgeMs,
  });

  return { accessToken, sessionId, refreshToken };
}
