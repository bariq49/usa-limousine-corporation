import { Injectable, type OnModuleDestroy } from "@nestjs/common";
import type { Server, Socket } from "socket.io";
import { sessionRoom, userRoom } from "./constants/rooms";
import type { Broadcast, BroadcastToRoom, RoomMembership } from "./types/websocket.types";

const SESSION_REVOKED_EVENT = "auth:session_revoked";

@Injectable()
export class WebsocketService implements OnModuleDestroy {
  private server: Server | null = null;

  isReady() {
    return this.server !== null;
  }

  attachServer(server: Server) {
    this.server = server;
  }

  async joinClientRooms(client: Socket, rooms: string[]) {
    for (const room of rooms) {
      await client.join(room);
    }
  }

  broadcast(params: Broadcast) {
    const { event, payload } = params;
    this.requireServer().emit(event, payload);
  }

  broadcastToRoom(params: BroadcastToRoom) {
    const { room, event, payload } = params;
    this.requireServer().to(room).emit(event, payload);
  }

  async setRoomMembership(params: RoomMembership) {
    if (!this.server) {
      return;
    }

    const { from, room, join } = params;
    const sockets = await this.server.in(from).fetchSockets();
    for (const socket of sockets) {
      if (join) {
        await socket.join(room);
      } else {
        await socket.leave(room);
      }
    }
  }

  /** User ids currently connected in a Socket.IO room. */
  async listRoomUserIds(room: string): Promise<string[]> {
    if (!this.server) {
      return [];
    }
    const sockets = await this.server.in(room).fetchSockets();
    const ids = new Set<string>();
    for (const socket of sockets) {
      const userId = (socket.data as { user?: { userId?: string } } | undefined)?.user?.userId;
      if (userId) {
        ids.add(userId);
      }
    }
    return [...ids];
  }

  disconnectSession(sessionId: string) {
    this.disconnectRoom(sessionRoom(sessionId), { reason: "session_revoked" });
  }

  disconnectUser(userId: string) {
    this.disconnectRoom(userRoom(userId), { reason: "session_revoked" });
  }

  /** Disconnect all sockets for the user except the kept session (logout-others). */
  async disconnectOtherSessions(userId: string, exceptSessionId: string) {
    const server = this.server;
    if (!server) {
      return;
    }

    const sockets = await server.in(userRoom(userId)).fetchSockets();
    for (const socket of sockets) {
      const sessionId = (socket.data as { user?: { sessionId?: string } } | undefined)?.user
        ?.sessionId;
      if (!sessionId || sessionId === exceptSessionId) {
        continue;
      }
      socket.emit(SESSION_REVOKED_EVENT, { reason: "session_revoked" });
      socket.disconnect(true);
    }
  }

  async onModuleDestroy() {
    if (this.server && typeof this.server.close === "function") {
      await new Promise<void>((resolve) => {
        this.server?.close(() => resolve());
      });
    }

    this.server = null;
  }

  private disconnectRoom(room: string, payload: { reason: string }) {
    const server = this.server;
    if (!server) {
      return;
    }

    server.to(room).emit(SESSION_REVOKED_EVENT, payload);
    void server.in(room).disconnectSockets(true);
  }

  private requireServer() {
    if (!this.server) {
      throw new Error("WebSocket server is not available");
    }

    return this.server;
  }
}
