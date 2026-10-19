import { Inject, Injectable, type OnModuleInit } from "@nestjs/common";
import { userRoom } from "../../../infrastructure/websocket/constants/rooms";
import { NOTIFICATION_WS_EVENTS } from "../../notification/constants/notification.constants";
import { ChannelRegistry } from "../../notification/services/recipient-channel.registry";
import { RecipientType } from "../../notification/types/notification";
import type { Channel } from "../../notification/types/recipient-channel";

@Injectable()
export class CustomerChannel implements Channel, OnModuleInit {
  readonly recipientType = RecipientType.USER;
  readonly createdEvent = NOTIFICATION_WS_EVENTS.CREATED;

  constructor(@Inject(ChannelRegistry) private readonly registry: ChannelRegistry) {}

  onModuleInit() {
    this.registry.register(this);
  }

  room(recipientId: string): string {
    return userRoom(recipientId);
  }
}
