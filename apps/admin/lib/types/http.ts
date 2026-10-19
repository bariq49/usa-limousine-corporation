import type { AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";

export type HttpRequestConfig = Pick<
  AxiosRequestConfig,
  "params" | "signal" | "timeout" | "headers" | "data"
>;

export type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};
