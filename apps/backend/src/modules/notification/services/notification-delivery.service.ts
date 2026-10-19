import { Inject, Injectable, forwardRef } from "@nestjs/common";
import { NotificationQueueService } from "../jobs/notification-queue.service";
import {
  type Deliver,
  type DeliverMany,
  type FcmData,
  type FcmSource,
} from "../types/notification";
import { NotificationRealtimeService } from "../websocket/notification-realtime.service";
import { TokenResolverRegistry } from "./push-token-resolver.registry";

@Injectable()
export class NotificationDeliveryService {
  constructor(
    @Inject(NotificationRealtimeService)
    private readonly realtime: NotificationRealtimeService,
    @Inject(forwardRef(() => NotificationQueueService))
    private readonly queue: NotificationQueueService,
    @Inject(TokenResolverRegistry)
    private readonly pushTokens: TokenResolverRegistry,
  ) {}

  async deliver(params: Deliver) {
    const { notification, push = true } = params;
    this.realtime.emitCreated(notification);

    if (!push) {
      return;
    }

    await this.enqueuePush(notification);
  }

  async deliverMany(params: DeliverMany) {
    const { notifications, push = true } = params;
    for (const notification of notifications) {
      this.realtime.emitCreated(notification);
    }

    if (!push) {
      return;
    }

    await this.enqueuePushes(notifications);
  }

  toFcmData(source: FcmSource): FcmData {
    const data: FcmData = {
      type: source.type,
      title: source.title,
      body: source.body,
    };

    if (source.id !== undefined) {
      data["notificationId"] = source.id;
    }

    if (source.data === undefined || source.data === null) {
      return data;
    }

    data["payload"] = JSON.stringify(source.data);

    if (typeof source.data === "object" && !Array.isArray(source.data)) {
      const root = source.data as Record<string, unknown>;
      this.flattenInto(data, root);

      const nested = root["payload"];
      if (typeof nested === "object" && nested !== null && !Array.isArray(nested)) {
        this.flattenInto(data, nested as Record<string, unknown>);
      }
    }

    return data;
  }

  private flattenInto(target: FcmData, fields: Record<string, unknown>): void {
    for (const [key, value] of Object.entries(fields)) {
      if (key === "payload" || value === undefined || value === null) {
        continue;
      }
      if (typeof value === "string") {
        target[key] = value;
        continue;
      }
      if (typeof value === "number" || typeof value === "boolean") {
        target[key] = String(value);
        continue;
      }
      target[key] = JSON.stringify(value);
    }
  }

  private async enqueuePush(notification: Deliver["notification"]) {
    const resolver = this.pushTokens.get(notification.recipientType);
    if (!resolver) {
      return;
    }

    const tokens = await resolver.resolveToken(notification.recipientId);
    if (tokens.length === 0) {
      return;
    }

    await this.queue.enqueuePush({
      tokens,
      title: notification.title,
      body: notification.body,
      data: this.toFcmData({
        type: notification.type,
        title: notification.title,
        body: notification.body,
        data: notification.data,
        id: notification.id,
      }),
    });
  }

  private async enqueuePushes(notifications: Deliver["notification"][]) {
    if (notifications.length === 0) {
      return;
    }

    const byType = new Map<string, Deliver["notification"][]>();
    for (const notification of notifications) {
      const key = String(notification.recipientType);
      const bucket = byType.get(key);
      if (bucket) {
        bucket.push(notification);
      } else {
        byType.set(key, [notification]);
      }
    }

    for (const group of byType.values()) {
      const first = group[0];
      if (!first) {
        continue;
      }

      const resolver = this.pushTokens.get(first.recipientType);
      if (!resolver) {
        continue;
      }

      const recipientIds = Array.from(new Set(group.map((n) => n.recipientId)));
      const tokensByRecipient = await resolver.resolveTokens(recipientIds);

      for (const notification of group) {
        const tokens = tokensByRecipient.get(notification.recipientId);
        if (!tokens || tokens.length === 0) {
          continue;
        }

        await this.queue.enqueuePush({
          tokens,
          title: notification.title,
          body: notification.body,
          data: this.toFcmData(notification),
        });
      }
    }
  }
}
