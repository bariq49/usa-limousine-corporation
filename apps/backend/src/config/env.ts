import type { ConfigService } from "@nestjs/config";
import { NodeEnvironment } from "./env.validation";

export type AuthCookieSameSite = "lax" | "strict" | "none";

export const DEFAULT_CSRF_HEADER_NAME = "x-csrf-token";
export const DEFAULT_CSRF_COOKIE_NAME = "usa_limo_csrf_token";
export const DEFAULT_AUTH_COOKIE_NAME = "usa_limo_refresh_token";

export type AuthCookieEnv = {
  name: string;
  httpOnly: boolean;
  secure: boolean;
  sameSite: AuthCookieSameSite;
  path: string;
  domain?: string | undefined;
  maxAgeSeconds: number;
};

export type CsrfCookieEnv = AuthCookieEnv & {
  headerName: string;
};

export type AppEnv = {
  NODE_ENV: NodeEnvironment;
  PORT: number;
  CORS_ORIGIN: boolean | string | string[];
  TRUST_PROXY: number;
  SWAGGER_ENABLED: boolean;
  authCookie: AuthCookieEnv;
  csrfCookie: CsrfCookieEnv;
};

export function parseOriginList(origin: string): boolean | string | string[] {
  if (origin.trim() === "*") {
    return true;
  }

  const origins = origin
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  return origins.length === 1 ? (origins[0] ?? origin) : origins;
}

export function assertCredentialedOriginList(params: {
  label: string;
  value: boolean | string | string[];
  nodeEnv: NodeEnvironment;
}): void {
  const { label, value, nodeEnv } = params;

  if (nodeEnv !== NodeEnvironment.Production) {
    return;
  }

  if (value === true) {
    throw new Error(`${label} cannot be a wildcard when credentials are enabled in production`);
  }

  if (value === false) {
    throw new Error(`${label} must be an explicit origin allowlist in production`);
  }

  const origins = typeof value === "string" ? [value] : value;
  if (origins.some((origin) => origin.trim() === "*")) {
    throw new Error(
      `${label} cannot include a wildcard when credentials are enabled in production`,
    );
  }
}

export function parseAuthCookieSameSite(value: string | undefined): AuthCookieSameSite {
  if (value === undefined || value.trim() === "") {
    return "strict";
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === "strict" || normalized === "none" || normalized === "lax") {
    return normalized;
  }

  throw new Error("AUTH_COOKIE_SAME_SITE must be lax, strict, or none");
}

function resolveCookieDomain(configService: ConfigService): string | undefined {
  const domain = configService.get<string>("AUTH_COOKIE_DOMAIN")?.trim();
  return domain ? domain : undefined;
}

function resolveAuthCookie(configService: ConfigService, nodeEnv: NodeEnvironment): AuthCookieEnv {
  const configuredSecure = configService.get<boolean>("AUTH_COOKIE_SECURE");
  const path = configService.get<string>("AUTH_COOKIE_PATH")?.trim();
  const httpOnly = configService.get<boolean>("AUTH_COOKIE_HTTP_ONLY");
  const secure =
    configuredSecure === undefined ? nodeEnv === NodeEnvironment.Production : configuredSecure;
  const sameSite = parseAuthCookieSameSite(configService.get<string>("AUTH_COOKIE_SAME_SITE"));
  const resolvedHttpOnly = httpOnly === undefined ? true : httpOnly;

  if (nodeEnv === NodeEnvironment.Production && secure === false) {
    throw new Error("AUTH_COOKIE_SECURE cannot be false in production");
  }

  if (nodeEnv === NodeEnvironment.Production && resolvedHttpOnly === false) {
    throw new Error("AUTH_COOKIE_HTTP_ONLY cannot be false in production");
  }

  if (nodeEnv === NodeEnvironment.Production && sameSite === "none" && secure !== true) {
    throw new Error("AUTH_COOKIE_SAME_SITE=none requires a Secure cookie in production");
  }

  const authCookie: AuthCookieEnv = {
    name: configService.get<string>("AUTH_COOKIE_NAME")?.trim() || DEFAULT_AUTH_COOKIE_NAME,
    httpOnly: resolvedHttpOnly,
    secure,
    sameSite,
    path: path || "/",
    maxAgeSeconds: configService.getOrThrow<number>("JWT_REFRESH_TTL_SECONDS"),
  };

  const domain = resolveCookieDomain(configService);
  if (domain) {
    authCookie.domain = domain;
  }

  return authCookie;
}

function resolveCsrfCookie(configService: ConfigService, authCookie: AuthCookieEnv): CsrfCookieEnv {
  const csrfCookie: CsrfCookieEnv = {
    name: configService.get<string>("AUTH_CSRF_COOKIE_NAME")?.trim() || DEFAULT_CSRF_COOKIE_NAME,
    headerName:
      configService.get<string>("AUTH_CSRF_HEADER_NAME")?.trim().toLowerCase() ||
      DEFAULT_CSRF_HEADER_NAME,
    httpOnly: true,
    secure: authCookie.secure,
    sameSite: authCookie.sameSite,
    path: authCookie.path,
    maxAgeSeconds: authCookie.maxAgeSeconds,
  };

  if (authCookie.domain) {
    csrfCookie.domain = authCookie.domain;
  }

  return csrfCookie;
}

export function getAppEnv(configService: ConfigService): AppEnv {
  const NODE_ENV = configService.getOrThrow<NodeEnvironment>("NODE_ENV");
  const CORS_ORIGIN = parseOriginList(configService.getOrThrow<string>("CORS_ORIGIN"));
  const authCookie = resolveAuthCookie(configService, NODE_ENV);

  assertCredentialedOriginList({
    label: "CORS_ORIGIN",
    value: CORS_ORIGIN,
    nodeEnv: NODE_ENV,
  });
  assertCredentialedOriginList({
    label: "WS_CORS_ORIGIN",
    value: parseOriginList(configService.getOrThrow<string>("WS_CORS_ORIGIN")),
    nodeEnv: NODE_ENV,
  });

  return {
    NODE_ENV,
    PORT: configService.getOrThrow<number>("PORT"),
    CORS_ORIGIN,
    TRUST_PROXY: configService.getOrThrow<number>("TRUST_PROXY"),
    SWAGGER_ENABLED: NODE_ENV !== NodeEnvironment.Production,
    authCookie,
    csrfCookie: resolveCsrfCookie(configService, authCookie),
  };
}
