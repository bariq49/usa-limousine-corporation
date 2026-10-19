import { Injectable } from "@nestjs/common";
import type { RecipientType } from "../types/notification";
import type { Channel } from "../types/recipient-channel";

@Injectable()
export class ChannelRegistry {
  private readonly channels = new Map<RecipientType, Channel>();

  register(channel: Channel): void {
    this.channels.set(channel.recipientType, channel);
  }

  get(recipientType: RecipientType): Channel | undefined {
    return this.channels.get(recipientType);
  }
}
