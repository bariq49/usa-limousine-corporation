import type { AuthTokens } from "../api/types";

let accessToken: string | null = null;
let csrfToken: string | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function getCsrfToken(): string | null {
  return csrfToken;
}

export function setCsrfToken(token: string | null): void {
  csrfToken = token;
}

export function hasAccessToken(): boolean {
  return typeof accessToken === "string" && accessToken.length > 0;
}

export function clearAuthSession(): void {
  accessToken = null;
  csrfToken = null;
}

export function applyAuthSession(params: AuthTokens): void {
  accessToken = params.accessToken;
}

const DEVICE_ID_KEY = "usa_limo_device_id";

export function getDeviceId(): string {
  if (typeof window === "undefined") {
    return "ssr-device";
  }

  try {
    const existing = window.localStorage.getItem(DEVICE_ID_KEY);
    if (existing && existing.trim().length > 0) {
      return existing;
    }

    const created =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `device-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    window.localStorage.setItem(DEVICE_ID_KEY, created);
    return created;
  } catch {
    return `device-${Date.now()}`;
  }
}
