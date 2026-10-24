export type HttpErrorInit = {
  status?: number;
  code?: string;
  canceled?: boolean;
  timeout?: boolean;
  method?: string;
  url?: string;
};

export class HttpError extends Error {
  readonly status?: number;
  readonly code?: string;
  readonly canceled: boolean;
  readonly timeout: boolean;
  readonly method?: string;
  readonly url?: string;

  constructor(message: string, init: HttpErrorInit = {}) {
    super(message);
    this.name = init.canceled ? "AbortError" : "HttpError";
    this.canceled = Boolean(init.canceled);
    this.timeout = Boolean(init.timeout);
    if (init.status !== undefined) {
      this.status = init.status;
    }
    if (init.code !== undefined) {
      this.code = init.code;
    }
    if (init.method !== undefined) {
      this.method = init.method;
    }
    if (init.url !== undefined) {
      this.url = init.url;
    }
  }
}

function requestContext(error: {
  config?: { method?: string; url?: string; baseURL?: string };
}): Pick<HttpErrorInit, "method" | "url"> {
  const method = error.config?.method?.toUpperCase();
  const url = error.config?.url;

  return {
    ...(method ? { method } : {}),
    ...(url ? { url } : {}),
  };
}

function messageFromResponseData(data: unknown): string | undefined {
  if (typeof data !== "object" || data === null) {
    return undefined;
  }

  const envelope = data as {
    error?: { message?: string | string[] };
    message?: string | string[];
  };

  const raw = envelope.error?.message ?? envelope.message;
  if (typeof raw === "string" && raw.trim().length > 0) {
    return raw;
  }

  if (Array.isArray(raw) && raw.length > 0) {
    return raw.filter((item): item is string => typeof item === "string").join(", ");
  }

  return undefined;
}

export function toHttpError(error: unknown): HttpError {
  if (error instanceof HttpError) {
    return error;
  }

  if (typeof error === "object" && error !== null) {
    const candidate = error as {
      isAxiosError?: boolean;
      code?: string;
      message?: string;
      name?: string;
      response?: { status?: number; data?: unknown };
      config?: { method?: string; url?: string };
    };

    const canceled =
      candidate.code === "ERR_CANCELED" ||
      candidate.name === "CanceledError" ||
      candidate.name === "AbortError";

    const timeout =
      candidate.code === "ECONNABORTED" ||
      candidate.code === "ETIMEDOUT" ||
      (typeof candidate.message === "string" &&
        candidate.message.toLowerCase().includes("timeout"));

    if (candidate.isAxiosError || canceled || timeout) {
      const status = candidate.response?.status;
      const context = requestContext(candidate);

      if (canceled) {
        return new HttpError("Request was cancelled", {
          ...context,
          code: candidate.code ?? "ERR_CANCELED",
          canceled: true,
        });
      }

      if (timeout) {
        return new HttpError("Request timed out", {
          ...context,
          code: candidate.code ?? "ECONNABORTED",
          timeout: true,
        });
      }

      if (typeof status === "number") {
        const apiMessage = messageFromResponseData(candidate.response?.data);
        return new HttpError(apiMessage ?? `Request failed with status ${status}`, {
          ...context,
          status,
          ...(candidate.code ? { code: candidate.code } : {}),
        });
      }

      return new HttpError("Network request failed", {
        ...context,
        code: candidate.code ?? "ERR_NETWORK",
      });
    }
  }

  if (error instanceof Error) {
    return new HttpError(error.message, { code: "UNKNOWN" });
  }

  return new HttpError("An unexpected error occurred", { code: "UNKNOWN" });
}
