import axios, { AxiosError } from "axios";
import { getApiBaseUrl } from "@/lib/api/base-url";

type ApiErrorBody = {
    error?: { message?: string | string[] };
    message?: string | string[];
};

const toText = (value: string | string[] | undefined) =>
    Array.isArray(value) ? value.join(", ") : value;

export const api = axios.create({
    baseURL: getApiBaseUrl(),
    headers: {
        "Content-Type": "application/json",
    },
});

// The backend wraps payloads as { success, data, meta }; resolve with that body.
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
        return Promise.reject({
            message,
            status: error.response?.status,
        });
    }
);
