import type { WebsocketAuthService } from "../src/infrastructure/websocket/websocket-auth.service";
import { WebsocketGateway } from "../src/infrastructure/websocket/websocket.gateway";
import type { WebsocketPresenceService } from "../src/infrastructure/websocket/websocket-presence.service";
import type { WebsocketRoomsService } from "../src/infrastructure/websocket/websocket-rooms.service";
import type { WebsocketService } from "../src/infrastructure/websocket/websocket.service";

describe("WebsocketGateway auto-join", () => {
  const wsConfig = {
    getOrThrow: () => "http://localhost:3001",
    get: () => undefined,
  };

  it("joins rooms from authenticated identity", async () => {
    const joinClientRooms = jest.fn(async () => undefined);
    const websocketService = {
      attachServer: jest.fn(),
      joinClientRooms,
    } as unknown as WebsocketService;

    const identity = {
      userId: "u1",
      sessionId: "s1",
      expiresAt: Math.floor(Date.now() / 1000) + 3_600,
    };
    const websocketAuth = {
      authenticate: jest.fn(async () => identity),
      ensureStillValid: jest.fn(async () => true),
    } as unknown as WebsocketAuthService;
    const roomsService = {
      forIdentity: jest.fn(async () => ["user:u1", "session:s1", "driver:driver-123"]),
    } as unknown as WebsocketRoomsService;
    const presenceService = {
      allowHandshake: jest.fn(async () => true),
      tryAcquireConnection: jest.fn(async () => true),
      releaseConnection: jest.fn(async () => undefined),
    } as unknown as WebsocketPresenceService;

    const gateway = new WebsocketGateway(
      websocketService,
      websocketAuth,
      roomsService,
      presenceService,
      wsConfig as never,
      { warn: jest.fn(), debug: jest.fn() } as never,
    );
    const client = {
      id: "sock-1",
      disconnect: jest.fn(),
      data: { user: identity },
    };

    await gateway.handleConnection(client as never);

    expect(roomsService.forIdentity).toHaveBeenCalledWith(identity);
    expect(joinClientRooms).toHaveBeenCalledWith(client, [
      "user:u1",
      "session:s1",
      "driver:driver-123",
    ]);
    expect(client.disconnect).not.toHaveBeenCalled();

    await gateway.handleDisconnect(client as never);
  });

  it("disconnects when identity is missing on the socket", async () => {
    const websocketService = {
      attachServer: jest.fn(),
      joinClientRooms: jest.fn(),
    } as unknown as WebsocketService;

    const gateway = new WebsocketGateway(
      websocketService,
      { authenticate: jest.fn(), ensureStillValid: jest.fn() } as never,
      { forIdentity: jest.fn() } as never,
      {
        allowHandshake: jest.fn(),
        tryAcquireConnection: jest.fn(),
        releaseConnection: jest.fn(),
      } as never,
      wsConfig as never,
      { warn: jest.fn(), debug: jest.fn() } as never,
    );
    const client = { id: "sock-2", disconnect: jest.fn(), data: {} };

    await gateway.handleConnection(client as never);

    expect(client.disconnect).toHaveBeenCalledWith(true);
    expect(websocketService.joinClientRooms).not.toHaveBeenCalled();
  });
});
