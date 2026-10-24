import axios, { type AxiosError, type AxiosInstance, type AxiosRequestConfig } from "axios";
import { refreshAccessToken } from "../auth/refresh";
import { clearAuthSession, getAccessToken, getDeviceId } from "../auth/session";
import API_ROUTES from "../api/routes";
import type { HttpRequestConfig, RetriableRequestConfig } from "../types/http";
import type { ApiSuccessResponse, MessageResponse } from "../types/response";
import { toHttpError } from "./error";

const AUTH_PUBLIC_PATHS = [
  API_ROUTES.AUTH_LOGIN,
  API_ROUTES.AUTH_REFRESH,
  API_ROUTES.AUTH_CSRF,
] as const;

function getBaseUrl(): string {
  const value = process.env["NEXT_PUBLIC_API_BASE_URL"];
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(
      "Missing required environment variable NEXT_PUBLIC_API_BASE_URL. Set it for this dashboard (see .env.example).",
    );
  }

  return value.trim();
}

function unwrapData<T>(body: unknown): T {
  if (
    typeof body === "object" &&
    body !== null &&
    "success" in body &&
    (body as { success: unknown }).success === true &&
    "data" in body
  ) {
    return (body as ApiSuccessResponse<T>).data;
  }

  return body as T;
}

function isAuthPublicPath(url?: string): boolean {
  return Boolean(url && AUTH_PUBLIC_PATHS.some((path) => url.includes(path)));
}

function redirectToLogin(): void {
  if (typeof window === "undefined" || window.location.pathname.startsWith("/auth")) {
    return;
  }

  const callback = encodeURIComponent(`${window.location.pathname}${window.location.search}`);
  window.location.assign(`/auth/login?callbackUrl=${callback}`);
}

export function createAxiosInstance(baseURL = getBaseUrl()): AxiosInstance {
  const instance = axios.create({
    baseURL,
    withCredentials: true,
    timeout: 30_000,
    headers: { Accept: "application/json", "X-App-Client": "admin" },
  });

  instance.interceptors.request.use((config) => {
    if (typeof FormData !== "undefined" && config.data instanceof FormData) {
      config.headers.delete("Content-Type");
      config.headers.delete("content-type");
    }

    config.headers.set("x-device-id", getDeviceId());

    const token = getAccessToken();
    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }

    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const original = error.config as RetriableRequestConfig | undefined;
      const status = error.response?.status;

      if (status === 401 && original && !original._retry && !isAuthPublicPath(original.url)) {
        original._retry = true;

        const nextToken = await refreshAccessToken(instance);
        if (nextToken) {
          original.headers.set("Authorization", `Bearer ${nextToken}`);
          return instance.request(original);
        }

        clearAuthSession();
        redirectToLogin();
      }

      return Promise.reject(error);
    },
  );

  return instance;
}

const axiosInstance = createAxiosInstance();

async function request<T>(config: AxiosRequestConfig): Promise<T> {
  try {
    const response = await axiosInstance.request(config);
    return unwrapData<T>(response.data);
  } catch (error) {
    throw toHttpError(error);
  }
}

export const http = {
  get: <T>(url: string, config?: HttpRequestConfig) =>
    request<T>({ ...config, method: "GET", url }),
  post: <T = MessageResponse>(url: string, data?: unknown, config?: HttpRequestConfig) =>
    request<T>({ ...config, method: "POST", url, data }),
  put: <T>(url: string, data?: unknown, config?: HttpRequestConfig) =>
    request<T>({ ...config, method: "PUT", url, data }),
  patch: <T>(url: string, data?: unknown, config?: HttpRequestConfig) =>
    request<T>({ ...config, method: "PATCH", url, data }),
  delete: <T>(url: string, config?: HttpRequestConfig) =>
    request<T>({ ...config, method: "DELETE", url }),
};
