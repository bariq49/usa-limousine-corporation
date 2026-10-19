import type { RecipientType } from "./notification";

export interface Channel {
  readonly recipientType: RecipientType;
  room(recipientId: string): string;
  readonly createdEvent: string;
}
