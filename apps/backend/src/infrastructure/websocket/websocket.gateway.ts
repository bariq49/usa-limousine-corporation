import { Inject } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ConnectedSocket, WebSocketGateway } from "@nestjs/websockets";
import type { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from "@nestjs/websockets";
import type { Server, Socket } from "socket.io";
import { AppLogger } from "../../common/logger/app.logger";
import { getWebSocketConfig } from "./websocket.config";
import { WebsocketAuthService } from "./websocket-auth.service";
import { WebsocketPresenceService } from "./websocket-presence.service";
import { WebsocketRoomsService } from "./websocket-rooms.service";
import { WebsocketService } from "./websocket.service";
import type { WebsocketIdentity } from "./types/websocket.types";

type SocketWithRevalidate = Socket & {
  data: {
    user?: WebsocketIdentity;
    revalidateTimer?: ReturnType<typeof setInterval>;
  };
};

@WebSocketGateway({
  namespace: "/",
})
export class WebsocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private readonly wsConfig;

  constructor(
    @Inject(WebsocketService) private readonly websocketService: WebsocketService,
    @Inject(WebsocketAuthService) private readonly websocketAuth: WebsocketAuthService,
    @Inject(WebsocketRoomsService) private readonly roomsService: WebsocketRoomsService,
    @Inject(WebsocketPresenceService) private readonly presenceService: WebsocketPresenceService,
    @Inject(ConfigService) configService: ConfigService,
    @Inject(AppLogger) private readonly logger: AppLogger,
  ) {
    this.wsConfig = getWebSocketConfig(configService);
  }

  afterInit(server: Server): void {
    this.websocketService.attachServer(server);

    server.use(async (socket, next) => {
      const ip = socket.handshake.address || "unknown";
      const allowed = await this.presenceService.allowHandshake({
        ip,
        limitPerMinute: this.wsConfig.connectRateLimitPerMinute,
      });
      if (!allowed) {
        next(new Error("Too many connection attempts"));
        return;
      }

      const identity = await this.websocketAuth.authenticate(socket);
      if (!identity) {
        next(new Error("Unauthorized"));
        return;
      }

      const acquired = await this.presenceService.tryAcquireConnection({
        userId: identity.userId,
        socketId: socket.id,
        maxConnections: this.wsConfig.maxConnectionsPerUser,
      });
      if (!acquired) {
        next(new Error("Too many connections"));
        return;
      }

      next();
    });
  }

  async handleConnection(@ConnectedSocket() client: SocketWithRevalidate): Promise<void> {
    const identity = client.data.user;
    if (!identity?.userId || !identity.sessionId) {
      this.logger.warn(`WebSocket missing identity (${client.id})`, WebsocketGateway.name);
      client.disconnect(true);
      return;
    }

    const rooms = await this.roomsService.forIdentity(identity);
    await this.websocketService.joinClientRooms(client, rooms);
    this.scheduleRevalidation(client, identity);

    this.logger.debug(
      `WebSocket connected user=${identity.userId} rooms=${rooms.join(",")}`,
      WebsocketGateway.name,
    );
  }

  async handleDisconnect(@ConnectedSocket() client: SocketWithRevalidate): Promise<void> {
    if (client.data.revalidateTimer) {
      clearInterval(client.data.revalidateTimer);
      client.data.revalidateTimer = undefined;
    }

    const identity = client.data.user;
    if (identity?.userId) {
      await this.presenceService.releaseConnection({
        userId: identity.userId,
        socketId: client.id,
      });
    }
  }

  private scheduleRevalidation(client: SocketWithRevalidate, identity: WebsocketIdentity): void {
    const seconds = this.wsConfig.sessionRevalidateSeconds;
    if (seconds <= 0) {
      return;
    }

    client.data.revalidateTimer = setInterval(() => {
      void (async () => {
        const stillValid = await this.websocketAuth.ensureStillValid(identity);
        if (!stillValid) {
          client.emit("auth:session_revoked", { reason: "session_invalid" });
          client.disconnect(true);
        }
      })();
    }, seconds * 1000);
  }
}
