import { Inject, Injectable } from "@nestjs/common";
import type { Notification } from "@prisma/client";
import { userRoom } from "../../../infrastructure/websocket/constants/rooms";
import { WebsocketService } from "../../../infrastructure/websocket/websocket.service";
import type { Payload } from "../../../infrastructure/websocket/types/websocket.types";
import { NOTIFICATION_WS_EVENTS } from "../constants/constants";
import type { ReadEvent, RemovedEvent } from "../types/notification";

@Injectable()
export class NotificationRealtimeService {
  constructor(@Inject(WebsocketService) private readonly websocketService: WebsocketService) {}

  emitCreated(notification: Notification): boolean {
    return this.broadcast(userRoom(notification.recipientId), NOTIFICATION_WS_EVENTS.CREATED, {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      body: notification.body,
      data: notification.data,
      createdAt: notification.createdAt.toISOString(),
      readAt: notification.readAt?.toISOString() ?? null,
    });
  }

  /** Keeps the badge in sync on every tab/device of the recipient. */
  emitRead(event: ReadEvent, unreadCount: number): void {
    this.broadcast(userRoom(event.recipientId), NOTIFICATION_WS_EVENTS.READ, {
      ids: event.ids,
      readAt: new Date().toISOString(),
      unreadCount,
    });
  }

  emitRemoved(event: RemovedEvent, unreadCount: number): void {
    this.broadcast(userRoom(event.recipientId), NOTIFICATION_WS_EVENTS.REMOVED, {
      ids: event.ids,
      unreadCount,
    });
  }

  private broadcast(room: string, event: string, payload: Payload): boolean {
    if (!this.websocketService.isReady()) {
      return false;
    }

    this.websocketService.broadcastToRoom({ room, event, payload });
    return true;
  }
}
