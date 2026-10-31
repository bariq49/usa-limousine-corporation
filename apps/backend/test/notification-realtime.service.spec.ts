import { NotificationRecipientType, NotificationType } from "@prisma/client";
import { NOTIFICATION_WS_EVENTS } from "../src/modules/notification/constants/constants";
import { NotificationRealtimeService } from "../src/modules/notification/websocket/notification-realtime.service";
import type { WebsocketService } from "../src/infrastructure/websocket/websocket.service";
import { userRoom } from "../src/infrastructure/websocket/constants/rooms";

describe("NotificationRealtimeService inbox", () => {
  it("emits notification.created via registered user channel", () => {
    const broadcastToRoom = jest.fn();
    const service = new NotificationRealtimeService({
      isReady: () => true,
      broadcastToRoom,
    } as unknown as WebsocketService);

    const createdAt = new Date("2026-01-01T12:00:00.000Z");
    const emitted = service.emitCreated({
      id: "n2",
      recipientType: NotificationRecipientType.USER,
      recipientId: "user-1",
      type: NotificationType.TICKET_REPLY,
      title: "Help ticket reply",
      body: "Support replied",
      data: null,
      createdAt,
      readAt: null,
    } as never);

    expect(broadcastToRoom).toHaveBeenCalledTimes(1);
    expect(broadcastToRoom).toHaveBeenCalledWith({
      room: userRoom("user-1"),
      event: NOTIFICATION_WS_EVENTS.CREATED,
      payload: expect.objectContaining({ id: "n2", readAt: null }),
    });
    expect(emitted).toBe(true);
  });

  it("skips emit when the websocket server is not ready", () => {
    const broadcastToRoom = jest.fn();
    const service = new NotificationRealtimeService({
      isReady: () => false,
      broadcastToRoom,
    } as unknown as WebsocketService);

    const emitted = service.emitCreated({
      id: "n3",
      recipientType: NotificationRecipientType.USER,
      recipientId: "user-1",
      type: NotificationType.BOOKING_CREATED,
      title: "x",
      body: "y",
      data: null,
      createdAt: new Date(),
      readAt: null,
    } as never);

    expect(broadcastToRoom).not.toHaveBeenCalled();
    expect(emitted).toBe(false);
  });

  it("emits notification.read with ids and the exact unread count", () => {
    const broadcastToRoom = jest.fn();
    const service = new NotificationRealtimeService({
      isReady: () => true,
      broadcastToRoom,
    } as unknown as WebsocketService);

    service.emitRead(
      { recipientType: NotificationRecipientType.USER, recipientId: "user-1", ids: ["n1"] },
      3,
    );

    expect(broadcastToRoom).toHaveBeenCalledWith({
      room: userRoom("user-1"),
      event: NOTIFICATION_WS_EVENTS.READ,
      payload: expect.objectContaining({ ids: ["n1"], unreadCount: 3 }),
    });
  });
});
