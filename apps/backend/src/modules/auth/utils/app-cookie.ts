import type { Request } from "express";

export const APP_CLIENT_HEADER = "x-app-client";

const APP_CLIENTS = new Set(["admin", "customer"]);

export function forAppClient<T extends { name: string }>(cookie: T, request: Request): T {
  const header = request.headers[APP_CLIENT_HEADER];
  const client = (Array.isArray(header) ? header[0] : header)?.trim().toLowerCase() ?? "";
  if (!APP_CLIENTS.has(client)) return cookie;
  return Object.assign({}, cookie, { name: `${cookie.name}_${client}` });
}
