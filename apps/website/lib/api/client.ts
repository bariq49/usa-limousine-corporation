import axios, { AxiosError } from "axios";
import { getApiBaseUrl } from "@/lib/api/base-url";

type ApiErrorBody = {
    error?: { message?: string | string[]; error?: string; details?: Record<string, unknown> };
    message?: string | string[];
};

export type ApiError = {
    message: string;
    status?: number | undefined;
    code?: string | undefined;
    details?: Record<string, unknown> | undefined;
};

const toText = (value: string | string[] | undefined) =>
    Array.isArray(value) ? value.join(", ") : value;

export const api = axios.create({
    baseURL: getApiBaseUrl(),
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.response.use(
    (response) => {
        return response.data;
    },
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
    }
);
