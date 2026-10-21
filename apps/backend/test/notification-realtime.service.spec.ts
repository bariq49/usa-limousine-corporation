import { NotificationRecipientType, NotificationType } from "@prisma/client";
import { NOTIFICATION_WS_EVENTS } from "../src/modules/notification/constants/notification.constants";
import { ChannelRegistry } from "../src/modules/notification/services/recipient-channel.registry";
import { NotificationRealtimeService } from "../src/modules/notification/websocket/notification-realtime.service";
import type { WebsocketService } from "../src/infrastructure/websocket/websocket.service";
import type { Channel } from "../src/modules/notification/types/recipient-channel";
import { RecipientType } from "../src/modules/notification/types/notification";
import { userRoom } from "../src/infrastructure/websocket/constants/rooms";

function channel(recipientType: RecipientType, roomFn: (id: string) => string): Channel {
  return {
    recipientType,
    room: roomFn,
    createdEvent: NOTIFICATION_WS_EVENTS.CREATED,
    readEvent: NOTIFICATION_WS_EVENTS.READ,
    removedEvent: NOTIFICATION_WS_EVENTS.REMOVED,
  };
}

describe("NotificationRealtimeService inbox", () => {
  it("emits notification.created via registered user channel", () => {
    const broadcastToRoom = jest.fn();
    const channels = new ChannelRegistry();
    channels.register(channel(RecipientType.USER, userRoom));

    const service = new NotificationRealtimeService(
      { isReady: () => true, broadcastToRoom } as unknown as WebsocketService,
      channels,
    );

    const createdAt = new Date("2026-01-01T12:00:00.000Z");
    service.emitCreated({
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
  });

  it("skips emit when no channel is registered", () => {
    const broadcastToRoom = jest.fn();
    const service = new NotificationRealtimeService(
      { isReady: () => true, broadcastToRoom } as unknown as WebsocketService,
      new ChannelRegistry(),
    );

    service.emitCreated({
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
  });

  it("emits notification.read with ids and the exact unread count", () => {
    const broadcastToRoom = jest.fn();
    const channels = new ChannelRegistry();
    channels.register(channel(RecipientType.USER, userRoom));

    const service = new NotificationRealtimeService(
      { isReady: () => true, broadcastToRoom } as unknown as WebsocketService,
      channels,
    );

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
