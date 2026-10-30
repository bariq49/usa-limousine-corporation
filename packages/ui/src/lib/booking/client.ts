import axios, { type AxiosError } from "axios";
import type { ApiError } from "../../types/api";

export type { ApiError };

type ApiErrorBody = {
  error?: { message?: string | string[]; error?: string; details?: Record<string, unknown> };
  message?: string | string[];
};

const toText = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value.join(", ") : value;

let configuredBaseUrl: string | null = null;

export function configureBookingApi(options: { baseUrl: string }) {
  const baseUrl = options.baseUrl.trim().replace(/\/+$/, "");
  if (!baseUrl) {
    throw new Error("Booking API baseUrl is required");
  }
  configuredBaseUrl = baseUrl;
  bookingApi.defaults.baseURL = baseUrl;
}

function requireBaseUrl(): string {
  if (configuredBaseUrl) return configuredBaseUrl;
  throw new Error("Call configureBookingApi({ baseUrl }) before using booking flow APIs");
}

export const bookingApi = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
});

bookingApi.interceptors.request.use((config) => {
  config.baseURL = requireBaseUrl();
  return config;
});

bookingApi.interceptors.response.use(
  (response) => response.data,
  async (error: AxiosError<ApiErrorBody | Blob>) => {
    let payload: ApiErrorBody | undefined;
    const data = error.response?.data;
    if (typeof Blob !== "undefined" && data instanceof Blob) {
      try {
        payload = JSON.parse(await data.text()) as ApiErrorBody;
      } catch {
        payload = undefined;
      }
    } else if (data && typeof data === "object") {
      payload = data as ApiErrorBody;
    }
    const message =
      toText(payload?.error?.message) ||
      toText(payload?.message) ||
      error.message ||
      "Something went wrong";
    const rejection: ApiError = {
      message,
      status: error.response?.status,
      code: payload?.error?.error,
      details: payload?.error?.details,
    };
    return Promise.reject(rejection);
  },
);
