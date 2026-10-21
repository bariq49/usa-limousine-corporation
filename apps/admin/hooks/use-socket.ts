import { useEffect, useState } from "react";
import type { Socket } from "socket.io-client";
import { refreshAccessToken } from "@/lib/auth/refresh";
import { createAxiosInstance } from "@/lib/http/client";
import { createSocket, SOCKET_EVENTS } from "@/lib/socket/client";

const MAX_AUTH_RETRIES = 3;
const RETRY_DELAY_MS = 10_000;

/**
 * One authenticated Socket.IO connection for the signed-in user.
 * Expired access tokens are refreshed and the socket reconnects; if the
 * refresh fails the session is gone and the user is sent to login.
 */
export function useSocket(enabled = true) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const client = createSocket();
    let authRetries = 0;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let disposed = false;

    const reconnectWithFreshToken = async () => {
      if (authRetries >= MAX_AUTH_RETRIES) {
        return;
      }
      authRetries += 1;

      const token = await refreshAccessToken(createAxiosInstance());
      if (disposed) {
        return;
      }
      if (!token) {
        window.location.assign("/auth/login");
        return;
      }
      client.connect();
    };

    client.on("connect", () => {
      authRetries = 0;
      setIsConnected(true);
    });

    client.on("disconnect", () => {
      setIsConnected(false);
    });

    client.on("connect_error", (error) => {
      setIsConnected(false);
      // Middleware rejections stop Socket.IO's own reconnect loop.
      if (client.active) {
        return;
      }
      if (error.message === "Unauthorized") {
        void reconnectWithFreshToken();
        return;
      }
      retryTimer = setTimeout(() => client.connect(), RETRY_DELAY_MS);
    });

    client.on(SOCKET_EVENTS.SESSION_REVOKED, () => {
      void reconnectWithFreshToken();
    });

    client.connect();
    setSocket(client);

    return () => {
      disposed = true;
      clearTimeout(retryTimer);
      client.removeAllListeners();
      client.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, [enabled]);

  return { socket, isConnected };
}
