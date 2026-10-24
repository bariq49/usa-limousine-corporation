import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";
import { refreshAccessToken } from "../auth/refresh";
import { clearAuthSession, getAccessToken, getDeviceId } from "../auth/session";
import API_ROUTES from "../api/routes";
import { toHttpError } from "./error";

export const DEFAULT_HTTP_TIMEOUT_MS = 30_000;

export type HttpRequestConfig = Pick<
  AxiosRequestConfig,
  "params" | "signal" | "timeout" | "headers" | "data"
>;

export type HttpClient = {
  get<T>(url: string, config?: HttpRequestConfig): Promise<T>;
  post<T>(url: string, data?: unknown, config?: HttpRequestConfig): Promise<T>;
  put<T>(url: string, data?: unknown, config?: HttpRequestConfig): Promise<T>;
  patch<T>(url: string, data?: unknown, config?: HttpRequestConfig): Promise<T>;
  delete<T>(url: string, config?: HttpRequestConfig): Promise<T>;
};

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

type ApiSuccessEnvelope<T> = {
  success: true;
  data: T;
};

function unwrapResponseData<T>(body: unknown): T {
  if (
    typeof body === "object" &&
    body !== null &&
    "success" in body &&
    (body as { success: unknown }).success === true &&
    "data" in body
  ) {
    return (body as ApiSuccessEnvelope<T>).data;
  }

  return body as T;
}

export function getApiBaseUrl(): string {
  const value = process.env["NEXT_PUBLIC_API_BASE_URL"];
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(
      "Missing required environment variable NEXT_PUBLIC_API_BASE_URL. Set it for this dashboard (see .env.example).",
    );
  }

  return value.trim();
}

export function applyTransportRequestConfig(
  config: InternalAxiosRequestConfig,
): InternalAxiosRequestConfig {
  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    config.headers.delete("Content-Type");
    config.headers.delete("content-type");
  }

  return config;
}

function isAuthPublicPath(url?: string): boolean {
  if (!url) {
    return false;
  }

  return (
    url.includes(API_ROUTES.AUTH_LOGIN) ||
    url.includes(API_ROUTES.AUTH_REGISTER) ||
    url.includes(API_ROUTES.AUTH_REFRESH) ||
    url.includes(API_ROUTES.AUTH_CSRF) ||
    url.includes(API_ROUTES.AUTH_FORGOT) ||
    url.includes(API_ROUTES.AUTH_RESET) ||
    url.includes(API_ROUTES.AUTH_VERIFY) ||
    url.includes(API_ROUTES.AUTH_RESEND_OTP)
  );
}

function redirectToLogin(): void {
  if (typeof window === "undefined") {
    return;
  }

  const path = window.location.pathname;
  if (path.startsWith("/auth")) {
    return;
  }

  const callback = encodeURIComponent(`${path}${window.location.search}`);
  window.location.assign(`/auth/login?callbackUrl=${callback}`);
}

export function createAxiosInstance(baseURL = getApiBaseUrl()): AxiosInstance {
  const instance = axios.create({
    baseURL,
    withCredentials: true,
    timeout: DEFAULT_HTTP_TIMEOUT_MS,
    headers: {
      Accept: "application/json",
      "X-App-Client": "customer",
    },
  });

  instance.interceptors.request.use((config) => {
    const next = applyTransportRequestConfig(config);
    next.headers.set("x-device-id", getDeviceId());

    const token = getAccessToken();
    if (token) {
      next.headers.set("Authorization", `Bearer ${token}`);
    }

    return next;
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

async function send<T>(instance: AxiosInstance, config: AxiosRequestConfig): Promise<T> {
  try {
    const response = await instance.request(config);
    return unwrapResponseData<T>(response.data);
  } catch (error) {
    throw toHttpError(error);
  }
}

export function createHttpFromInstance(instance: AxiosInstance): HttpClient {
  return {
    get: <T>(url: string, config?: HttpRequestConfig) =>
      send<T>(instance, { ...config, method: "GET", url }),
    post: <T>(url: string, data?: unknown, config?: HttpRequestConfig) =>
      send<T>(instance, { ...config, method: "POST", url, data }),
    put: <T>(url: string, data?: unknown, config?: HttpRequestConfig) =>
      send<T>(instance, { ...config, method: "PUT", url, data }),
    patch: <T>(url: string, data?: unknown, config?: HttpRequestConfig) =>
      send<T>(instance, { ...config, method: "PATCH", url, data }),
    delete: <T>(url: string, config?: HttpRequestConfig) =>
      send<T>(instance, { ...config, method: "DELETE", url }),
  };
}

export function createHttp(baseURL = getApiBaseUrl()): HttpClient {
  return createHttpFromInstance(createAxiosInstance(baseURL));
}

export const http = createHttp();
