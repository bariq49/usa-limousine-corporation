import { NotificationRecipientType, NotificationType } from "@prisma/client";
import { NOTIFICATION_WS_EVENTS } from "../src/modules/notification/constants/notification.constants";
import { DRIVER_NOTIFICATION_WS_EVENTS } from "../src/modules/driver/constants/driver.constants";
import { ChannelRegistry } from "../src/modules/notification/services/recipient-channel.registry";
import { NotificationRealtimeService } from "../src/modules/notification/websocket/notification-realtime.service";
import type { WebsocketService } from "../src/infrastructure/websocket/websocket.service";
import type { Channel } from "../src/modules/notification/types/recipient-channel";
import { RecipientType } from "../src/modules/notification/types/notification";
import { driverRoom, userRoom } from "../src/infrastructure/websocket/constants/rooms";

function channel(
  recipientType: RecipientType,
  roomFn: (id: string) => string,
  createdEvent: string,
): Channel {
  return { recipientType, room: roomFn, createdEvent };
}

describe("NotificationRealtimeService inbox", () => {
  it("emits driver created event via registered channel", () => {
    const broadcastToRoom = jest.fn();
    const channels = new ChannelRegistry();
    channels.register(
      channel(RecipientType.DRIVER, driverRoom, DRIVER_NOTIFICATION_WS_EVENTS.CREATED),
    );

    const service = new NotificationRealtimeService(
      { isReady: () => true, broadcastToRoom } as unknown as WebsocketService,
      channels,
    );

    const createdAt = new Date("2026-01-01T12:00:00.000Z");
    service.emitCreated({
      id: "n1",
      recipientType: NotificationRecipientType.DRIVER,
      recipientId: "driver-1",
      type: NotificationType.BOOKING_AVAILABLE,
      title: "New booking",
      body: "BK-1",
      data: { bookingId: "booking-1" },
      createdAt,
      readAt: null,
    } as never);

    expect(broadcastToRoom).toHaveBeenCalledTimes(1);
    expect(broadcastToRoom).toHaveBeenCalledWith({
      room: driverRoom("driver-1"),
      event: DRIVER_NOTIFICATION_WS_EVENTS.CREATED,
      payload: expect.objectContaining({
        id: "n1",
        type: NotificationType.BOOKING_AVAILABLE,
        readAt: null,
      }),
    });
  });

  it("emits notification.created via registered user channel", () => {
    const broadcastToRoom = jest.fn();
    const channels = new ChannelRegistry();
    channels.register(channel(RecipientType.USER, userRoom, NOTIFICATION_WS_EVENTS.CREATED));

    const service = new NotificationRealtimeService(
      { isReady: () => true, broadcastToRoom } as unknown as WebsocketService,
      channels,
    );

    const createdAt = new Date("2026-01-01T12:00:00.000Z");
    service.emitCreated({
      id: "n2",
      recipientType: NotificationRecipientType.USER,
      recipientId: "user-1",
      type: NotificationType.TRIP_CANCELLED,
      title: "Trip cancelled",
      body: "Cancelled",
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
      recipientType: NotificationRecipientType.DRIVER,
      recipientId: "driver-1",
      type: NotificationType.BOOKING_AVAILABLE,
      title: "x",
      body: "y",
      data: null,
      createdAt: new Date(),
      readAt: null,
    } as never);

    expect(broadcastToRoom).not.toHaveBeenCalled();
  });
});
