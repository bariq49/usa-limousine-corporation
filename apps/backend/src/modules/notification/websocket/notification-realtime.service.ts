import { Inject, Injectable } from "@nestjs/common";
import type { Notification } from "@prisma/client";
import { WebsocketService } from "../../../infrastructure/websocket/websocket.service";
import type { Payload } from "../../../infrastructure/websocket/types/websocket.types";
import { ChannelRegistry } from "../services/recipient-channel.registry";

@Injectable()
export class NotificationRealtimeService {
  constructor(
    @Inject(WebsocketService) private readonly websocketService: WebsocketService,
    @Inject(ChannelRegistry) private readonly channels: ChannelRegistry,
  ) {}

  emitCreated(notification: Notification): void {
    const channel = this.channels.get(notification.recipientType);
    if (!channel) {
      return;
    }

    this.broadcast(channel.room(notification.recipientId), channel.createdEvent, {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      body: notification.body,
      data: notification.data,
      createdAt: notification.createdAt.toISOString(),
      readAt: notification.readAt?.toISOString() ?? null,
    });
  }

  private broadcast(room: string, event: string, payload: Payload): void {
    if (!this.websocketService.isReady()) {
      return;
    }

    this.websocketService.broadcastToRoom({ room, event, payload });
  }
}
