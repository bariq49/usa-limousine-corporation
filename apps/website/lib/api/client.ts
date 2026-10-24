import axios, { AxiosError } from "axios";
import { getApiBaseUrl } from "@/lib/api/base-url";

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
    async (error: AxiosError<{ error?: string; message?: string }>) => {
        const message =
            error.response?.data?.error ||
            error.response?.data?.message ||
            error.message ||
            "Something went wrong";
        return Promise.reject({
            message,
            status: error.response?.status,
        });
    }
);
