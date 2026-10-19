import type { AxiosInstance } from "axios";
import API_ROUTES from "../api/routes";
import type { AuthTokens, CsrfResponse } from "../api/types";
import { applyAuthSession, clearAuthSession, getCsrfToken, setCsrfToken } from "./session";

type Envelope<T> = {
  success: true;
  data: T;
};

let refreshPromise: Promise<string | null> | null = null;

async function ensureCsrfToken(instance: AxiosInstance): Promise<string> {
  const existing = getCsrfToken();
  if (existing) {
    return existing;
  }

  const response = await instance.get<Envelope<CsrfResponse>>(API_ROUTES.AUTH_CSRF);
  const token = response.data.data.csrfToken;
  setCsrfToken(token);
  return token;
}

export function refreshAccessToken(instance: AxiosInstance): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const csrf = await ensureCsrfToken(instance);
        const response = await instance.post<Envelope<AuthTokens>>(
          API_ROUTES.AUTH_REFRESH,
          {},
          {
            headers: {
              "x-csrf-token": csrf,
            },
          },
        );
        const tokens = response.data.data;
        applyAuthSession(tokens);
        return tokens.accessToken;
      } catch {
        clearAuthSession();
        return null;
      }
    })().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}
