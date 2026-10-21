import { io, type Socket } from "socket.io-client";
import { getAccessToken } from "../auth/session";

export const SOCKET_EVENTS = {
  NOTIFICATION_CREATED: "notification.created",
  NOTIFICATION_READ: "notification.read",
  NOTIFICATION_REMOVED: "notification.removed",
  SESSION_REVOKED: "auth:session_revoked",
} as const;

/** Socket.IO lives on the API origin; NEXT_PUBLIC_SOCKET_URL overrides it. */
export function getSocketUrl(): string {
  const explicit = process.env["NEXT_PUBLIC_SOCKET_URL"];
  if (typeof explicit === "string" && explicit.trim()) {
    return explicit.trim();
  }

  return new URL(process.env["NEXT_PUBLIC_API_BASE_URL"] ?? "").origin;
}

export function createSocket(): Socket {
  return io(getSocketUrl(), {
    autoConnect: false,
    withCredentials: true,
    transports: ["websocket", "polling"],
    reconnectionDelay: 1_000,
    reconnectionDelayMax: 10_000,
    // Read on every (re)connect so a refreshed access token is used.
    auth: (cb) => cb({ token: getAccessToken() ?? "" }),
  });
}
