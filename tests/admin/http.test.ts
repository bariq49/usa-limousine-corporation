import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  AxiosError,
  AxiosHeaders,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";
import { describe, expect, it, vi } from "vitest";
import { createAxiosInstance, http } from "../../apps/admin/lib/http/client";
import { HttpError, toHttpError } from "../../apps/admin/lib/http/error";
import type { HttpRequestConfig } from "../../apps/admin/lib/types/http";
import type { ApiSuccessResponse, MessageResponse } from "../../apps/admin/lib/types/response";

const HTTP_TIMEOUT_MS = 30_000;

function readHttpSources() {
  const dirs = [join(process.cwd(), "lib/http"), join(process.cwd(), "apps/admin/lib/http")];
  const dir = dirs.find((candidate) => existsSync(candidate));
  if (!dir) {
    throw new Error("Could not find admin HTTP source");
  }

  return readdirSync(dir)
    .filter((name) => name.endsWith(".ts"))
    .map((name) => readFileSync(join(dir, name), "utf8"))
    .join("\n");
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

function createHttpFromInstance(instance: AxiosInstance) {
  async function request<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response = await instance.request(config);
      return unwrapData<T>(response.data);
    } catch (error) {
      throw toHttpError(error);
    }
  }

  return {
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
}

function httpWithAdapter(
  adapter: (config: InternalAxiosRequestConfig) => Promise<unknown> | unknown,
) {
  const instance = createAxiosInstance("http://transport.test/api");
  instance.defaults.adapter = async (config) => {
    const result = await adapter(config);
    return result as Awaited<ReturnType<NonNullable<typeof instance.defaults.adapter>>>;
  };
  return createHttpFromInstance(instance);
}

describe("admin HTTP transport", () => {
  it("creates an Axios instance with base URL, credentials, timeout, and JSON accept", () => {
    expect(typeof http.get).toBe("function");
    expect(typeof http.post).toBe("function");
    expect(typeof http.put).toBe("function");
    expect(typeof http.patch).toBe("function");
    expect(typeof http.delete).toBe("function");

    const instance = createAxiosInstance("http://admin.example.test/api/v1");
    expect(instance.defaults.baseURL).toBe("http://admin.example.test/api/v1");
    expect(instance.defaults.withCredentials).toBe(true);
    expect(instance.defaults.timeout).toBe(HTTP_TIMEOUT_MS);
    expect(instance.defaults.headers.Accept).toBe("application/json");
    expect(instance.defaults.headers["Content-Type"]).toBeUndefined();
  });

  it("creates independent axios instances", () => {
    const first = createAxiosInstance("http://one.example.test/api");
    const second = createAxiosInstance("http://two.example.test/api");
    expect(first).not.toBe(second);
    expect(first.defaults.baseURL).not.toBe(second.defaults.baseURL);
  });

  it("requires NEXT_PUBLIC_API_BASE_URL when base URL is omitted", () => {
    expect(createAxiosInstance("http://localhost:3000/api/v1").defaults.baseURL).toBe(
      "http://localhost:3000/api/v1",
    );
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "");
    expect(() => createAxiosInstance()).toThrow(/NEXT_PUBLIC_API_BASE_URL/);
    vi.unstubAllEnvs();
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://localhost:3000/api/v1");
  });

  it("returns response payload data for JSON requests", async () => {
    let contentType: unknown;
    const client = httpWithAdapter(async (config) => {
      contentType = config.headers.get("Content-Type") ?? config.headers.get("content-type");
      return {
        data: { id: 7 },
        status: 200,
        statusText: "OK",
        headers: {},
        config,
      };
    });

    await expect(client.post("/example", { name: "transport" })).resolves.toEqual({ id: 7 });
    expect(String(contentType)).toMatch(/application\/json/i);
  });

  it("unwraps API success envelopes to the data payload", async () => {
    const client = httpWithAdapter(async (config) => {
      return {
        data: {
          success: true,
          data: { accessToken: "token", sessionId: "session" },
        },
        status: 200,
        statusText: "OK",
        headers: {},
        config,
      };
    });

    await expect(client.post("/auth/login", {})).resolves.toEqual({
      accessToken: "token",
      sessionId: "session",
    });
  });

  it("does not force application/json for FormData bodies", async () => {
    let contentType: unknown;
    let body: unknown;
    const client = httpWithAdapter(async (config) => {
      contentType = config.headers.get("Content-Type") ?? config.headers.get("content-type");
      body = config.data;
      return {
        data: { uploaded: true },
        status: 200,
        statusText: "OK",
        headers: {},
        config,
      };
    });

    const form = new FormData();
    form.append("file", "blob");
    await expect(client.post("/upload", form)).resolves.toEqual({ uploaded: true });
    expect(body).toBeInstanceOf(FormData);
    expect(String(contentType ?? "")).not.toMatch(/application\/json/i);
  });

  it("normalizes HTTP response errors without leaking bodies", async () => {
    const client = httpWithAdapter(async (config) => {
      throw new AxiosError("Request failed", "ERR_BAD_REQUEST", config, undefined, {
        status: 401,
        statusText: "Unauthorized",
        data: { password: "secret", token: "leak" },
        headers: new AxiosHeaders(),
        config,
      });
    });

    const error = await client.get("/secure").catch((caught) => caught);
    expect(error).toBeInstanceOf(HttpError);
    expect(error.status).toBe(401);
    expect(error.message).toBe("Request failed with status 401");
    expect(error.message).not.toMatch(/secret|token|password/i);
    expect(JSON.stringify(error)).not.toMatch(/secret|leak/);
  });

  it("normalizes network errors", async () => {
    const client = httpWithAdapter(async (config) => {
      throw new AxiosError("Network Error", "ERR_NETWORK", config);
    });

    const error = await client.get("/down").catch((caught) => caught);
    expect(error).toBeInstanceOf(HttpError);
    expect(error.status).toBeUndefined();
    expect(error.code).toBe("ERR_NETWORK");
    expect(error.message).toBe("Network request failed");
  });

  it("normalizes timeout errors", async () => {
    const client = httpWithAdapter(async (config) => {
      throw new AxiosError("timeout of 30ms exceeded", "ECONNABORTED", config);
    });

    const error = await client.get("/slow").catch((caught) => caught);
    expect(error).toBeInstanceOf(HttpError);
    expect(error.timeout).toBe(true);
    expect(error.message).toBe("Request timed out");
  });

  it("normalizes cancellation via AbortSignal", async () => {
    const controller = new AbortController();
    controller.abort();
    const client = httpWithAdapter(async () => {
      throw new Error("adapter should not run after abort");
    });

    const error = await client
      .get("/cancel", { signal: controller.signal })
      .catch((caught) => caught);
    expect(error).toBeInstanceOf(HttpError);
    expect(error.canceled).toBe(true);
    expect(error.name).toBe("AbortError");
  });

  it("maps unknown errors without dumping Axios objects", () => {
    const error = toHttpError("nope");
    expect(error).toBeInstanceOf(HttpError);
    expect(error.code).toBe("UNKNOWN");
    expect(error.message).toBe("An unexpected error occurred");
  });

  it("surfaces API error messages from the envelope", async () => {
    const client = httpWithAdapter(async (config) => {
      throw new AxiosError("Request failed", "ERR_BAD_REQUEST", config, undefined, {
        status: 403,
        statusText: "Forbidden",
        data: { error: { message: "Verify your email before signing in" } },
        headers: new AxiosHeaders(),
        config,
      });
    });

    const error = await client.post("/auth/login", {}).catch((caught) => caught);
    expect(error).toBeInstanceOf(HttpError);
    expect(error.message).toBe("Verify your email before signing in");
  });

  it("does not log credentials and does not import another dashboard", () => {
    const source = readHttpSources();
    expect(source).not.toMatch(/console\.(log|debug|info|warn)/);
    expect(source).not.toMatch(/apps\/(staff|agency|customer)/);
  });
});
