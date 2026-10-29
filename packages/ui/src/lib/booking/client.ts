import axios, { AxiosError } from "axios";
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
  async (error: AxiosError<ApiErrorBody>) => {
    const message =
      toText(error.response?.data?.error?.message) ||
      toText(error.response?.data?.message) ||
      error.message ||
      "Something went wrong";
    const rejection: ApiError = {
      message,
      status: error.response?.status,
      code: error.response?.data?.error?.error,
      details: error.response?.data?.error?.details,
    };
    return Promise.reject(rejection);
  },
);
