import type { ConfigService } from "@nestjs/config";
import {
  DEFAULT_CSRF_HEADER_NAME,
  assertCredentialedOriginList,
  getAppEnv,
  parseAuthCookieSameSite,
  parseOriginList,
} from "../src/config/env";
import { NodeEnvironment, validateEnvironment } from "../src/config/env.validation";
import { csrfTokensEqual, createCsrfToken } from "../src/modules/auth/utils/csrf";

function productionEnv(overrides: Record<string, unknown> = {}) {
  return {
    NODE_ENV: "production",
    PORT: "3000",
    CORS_ORIGIN: "https://admin.example.com,https://staff.example.com",
    DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/ams",
    TRUST_PROXY: "1",
    REDIS_URL: "redis://localhost:6379",
    CLOUDINARY_CLOUD_NAME: "cloud",
    CLOUDINARY_API_KEY: "key",
    CLOUDINARY_API_SECRET: "secret",
    WS_CORS_ORIGIN: "https://admin.example.com",
    JWT_ACCESS_SECRET: "a".repeat(32),
    JWT_REFRESH_SECRET: "b".repeat(32),
    JWT_ACCESS_TTL_SECONDS: "43200",
    JWT_REFRESH_TTL_SECONDS: "86400",
    JWT_REMEMBER_ME_TTL_SECONDS: "7776000",
    AUTH_LOGIN_MAX_ATTEMPTS: "5",
    AUTH_LOCKOUT_MINUTES: "15",
    EMAIL_HOST: "smtp.example.com",
    EMAIL_PORT: "465",
    EMAIL_USER: "ops@example.com",
    EMAIL_PASS: "pass",
    EMAIL_FROM: "ops@example.com",
    WEBSITE_URL: "https://demo.usalimocorp.com",
    CUSTOMER_APP_URL: "https://customer.usalimocorp.com",
    FIREBASE_PROJECT_ID: "usa-limousine-corporation",
    FIREBASE_CLIENT_EMAIL: "firebase-adminsdk@usa-limousine-corporation.iam.gserviceaccount.com",
    FIREBASE_PRIVATE_KEY: "-----BEGIN PRIVATE KEY-----\\ntest\\n-----END PRIVATE KEY-----",
    ...overrides,
  };
}

function mockConfig(values: Record<string, unknown>): ConfigService {
  return {
    getOrThrow: (key: string) => {
      if (values[key] === undefined) {
        throw new Error(`Missing ${key}`);
      }
      return values[key];
    },
    get: (key: string) => values[key],
  } as ConfigService;
}

describe("CSRF tokens", () => {
  it("generates 64 hex characters from cryptographically strong bytes", () => {
    const token = createCsrfToken();
    expect(token).toMatch(/^[0-9a-f]{64}$/);
    expect(token).toHaveLength(64);
    expect(createCsrfToken()).not.toBe(token);
  });

  it("compares tokens without throwing on length mismatch or empty values", () => {
    const token = createCsrfToken();
    expect(csrfTokensEqual(token, token)).toBe(true);
    expect(csrfTokensEqual(token, createCsrfToken())).toBe(false);
    expect(csrfTokensEqual(token, token.slice(0, 8))).toBe(false);
    expect(csrfTokensEqual("", "")).toBe(false);
    expect(csrfTokensEqual("", token)).toBe(false);
    expect(csrfTokensEqual(token, "")).toBe(false);
    expect(() => csrfTokensEqual(token, token.slice(0, 8))).not.toThrow();
  });
});

describe("credentialed CORS configuration", () => {
  it("parses explicit dashboard origin lists", () => {
    expect(parseOriginList("http://localhost:3001,http://localhost:3002")).toEqual([
      "http://localhost:3001",
      "http://localhost:3002",
    ]);
  });

  it("rejects wildcards in production", () => {
    expect(() =>
      assertCredentialedOriginList({
        label: "CORS_ORIGIN",
        value: true,
        nodeEnv: NodeEnvironment.Production,
      }),
    ).toThrow(/wildcard/);
  });

  it("allows wildcards outside production", () => {
    expect(() =>
      assertCredentialedOriginList({
        label: "CORS_ORIGIN",
        value: true,
        nodeEnv: NodeEnvironment.Development,
      }),
    ).not.toThrow();
  });

  it("fails production environment validation for wildcard CORS", () => {
    expect(() => validateEnvironment(productionEnv({ CORS_ORIGIN: "*" }))).toThrow(/wildcard/);
  });
});

describe("production cookie configuration", () => {
  it("rejects AUTH_COOKIE_HTTP_ONLY=false", () => {
    expect(() => validateEnvironment(productionEnv({ AUTH_COOKIE_HTTP_ONLY: "false" }))).toThrow(
      /AUTH_COOKIE_HTTP_ONLY/,
    );
  });

  it("rejects AUTH_COOKIE_SECURE=false", () => {
    expect(() => validateEnvironment(productionEnv({ AUTH_COOKIE_SECURE: "false" }))).toThrow(
      /AUTH_COOKIE_SECURE/,
    );
  });

  it("rejects invalid AUTH_COOKIE_SAME_SITE instead of coercing it", () => {
    expect(() => validateEnvironment(productionEnv({ AUTH_COOKIE_SAME_SITE: "invalid" }))).toThrow(
      /Environment validation failed/,
    );
    expect(() => parseAuthCookieSameSite("invalid")).toThrow(/AUTH_COOKIE_SAME_SITE/);
  });

  it("rejects SameSite=None without Secure in production", () => {
    expect(() =>
      validateEnvironment(
        productionEnv({ AUTH_COOKIE_SAME_SITE: "none", AUTH_COOKIE_SECURE: "false" }),
      ),
    ).toThrow(/AUTH_COOKIE_SECURE/);
  });

  it("accepts SameSite=None when production cookies are Secure", () => {
    const env = getAppEnv(
      mockConfig({
        NODE_ENV: NodeEnvironment.Production,
        PORT: 3000,
        CORS_ORIGIN: "https://admin.example.com",
        WS_CORS_ORIGIN: "https://admin.example.com",
        TRUST_PROXY: 1,
        JWT_REFRESH_TTL_SECONDS: 86_400,
        AUTH_COOKIE_SAME_SITE: "none",
        AUTH_COOKIE_SECURE: true,
        AUTH_COOKIE_HTTP_ONLY: true,
      }),
    );

    expect(env.authCookie.sameSite).toBe("none");
    expect(env.authCookie.secure).toBe(true);
  });

  it("accepts a valid production cookie configuration", () => {
    expect(() =>
      validateEnvironment(
        productionEnv({
          AUTH_COOKIE_HTTP_ONLY: "true",
          AUTH_COOKIE_SECURE: "true",
          AUTH_COOKIE_SAME_SITE: "strict",
        }),
      ),
    ).not.toThrow();
  });

  it("resolves production refresh cookies as httpOnly Secure with configured SameSite and path", () => {
    const env = getAppEnv(
      mockConfig({
        NODE_ENV: NodeEnvironment.Production,
        PORT: 3000,
        CORS_ORIGIN: "https://admin.example.com",
        WS_CORS_ORIGIN: "https://admin.example.com",
        TRUST_PROXY: 1,
        JWT_REFRESH_TTL_SECONDS: 86_400,
        AUTH_COOKIE_HTTP_ONLY: true,
        AUTH_COOKIE_SECURE: true,
        AUTH_COOKIE_SAME_SITE: "lax",
        AUTH_COOKIE_PATH: "/",
        AUTH_COOKIE_NAME: "usa_limo_refresh_token",
        AUTH_CSRF_COOKIE_NAME: "usa_limo_csrf_token",
        AUTH_CSRF_HEADER_NAME: "X-CSRF-Token",
      }),
    );

    expect(env.authCookie).toMatchObject({
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAgeSeconds: 86_400,
    });
    expect(env.csrfCookie.httpOnly).toBe(true);
    expect(env.csrfCookie.secure).toBe(true);
    expect(env.csrfCookie.sameSite).toBe("lax");
    expect(env.csrfCookie.path).toBe("/");
    expect(env.csrfCookie.name).not.toBe(env.authCookie.name);
    expect(env.csrfCookie.headerName).toBe(DEFAULT_CSRF_HEADER_NAME);
  });

  it("uses the configured CSRF header name as the only runtime source", () => {
    const env = getAppEnv(
      mockConfig({
        NODE_ENV: NodeEnvironment.Test,
        PORT: 3000,
        CORS_ORIGIN: "http://localhost:3001",
        WS_CORS_ORIGIN: "http://localhost:3001",
        TRUST_PROXY: 0,
        JWT_REFRESH_TTL_SECONDS: 86_400,
        AUTH_COOKIE_SECURE: false,
        AUTH_COOKIE_SAME_SITE: "lax",
        AUTH_CSRF_HEADER_NAME: "X-Custom-Csrf",
      }),
    );

    expect(env.csrfCookie.headerName).toBe("x-custom-csrf");
    expect(env.csrfCookie.headerName).not.toBe("x-csrf-token");
  });
});
