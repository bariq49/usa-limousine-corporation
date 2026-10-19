import { Inject, Injectable, type OnModuleInit } from "@nestjs/common";
import { driverRoom } from "../../../infrastructure/websocket/constants/rooms";
import { ChannelRegistry } from "../../notification/services/recipient-channel.registry";
import { RecipientType } from "../../notification/types/notification";
import type { Channel } from "../../notification/types/recipient-channel";
import { DRIVER_NOTIFICATION_WS_EVENTS } from "../constants/driver.constants";

@Injectable()
export class DriverChannel implements Channel, OnModuleInit {
  readonly recipientType = RecipientType.DRIVER;
  readonly createdEvent = DRIVER_NOTIFICATION_WS_EVENTS.CREATED;

  constructor(@Inject(ChannelRegistry) private readonly registry: ChannelRegistry) {}

  onModuleInit() {
    this.registry.register(this);
  }

  room(recipientId: string): string {
    return driverRoom(recipientId);
  }
}
