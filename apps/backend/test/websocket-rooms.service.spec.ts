import { sessionRoom, userRoom } from "../src/infrastructure/websocket/constants/rooms";
import { WebsocketRoomsService } from "../src/infrastructure/websocket/websocket-rooms.service";
import type { WebsocketIdentity } from "../src/infrastructure/websocket/types/websocket.types";

describe("WebsocketRoomsService", () => {
  it("joins the user and session rooms", async () => {
    const identity: WebsocketIdentity = { userId: "user-1", sessionId: "session-1", expiresAt: 0 };

    await expect(new WebsocketRoomsService().forIdentity(identity)).resolves.toEqual([
      userRoom("user-1"),
      sessionRoom("session-1"),
    ]);
  });
});
