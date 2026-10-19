import { Inject, Injectable } from "@nestjs/common";
import { chatRoom, driverRoom, userRoom } from "../../../infrastructure/websocket/constants/rooms";
import { WebsocketService } from "../../../infrastructure/websocket/websocket.service";
import { CHAT_WS_EVENTS } from "../constants/chat.constants";
import type {
  AudienceEvent,
  ConversationEvent,
  EmitToAudience,
  EmitToConversation,
  JoinConversation,
  LeaveConversation,
  UserInConversation,
} from "../types/chat";

@Injectable()
export class ChatRealtimeService {
  constructor(@Inject(WebsocketService) private readonly websocket: WebsocketService) {}

  toConversation(props: EmitToConversation): void {
    if (!this.websocket.isReady()) {
      return;
    }
    this.websocket.broadcastToRoom({
      room: chatRoom(props.conversationId),
      event: props.event,
      payload: props.payload,
    });
  }

  messageCreated(props: ConversationEvent): void {
    this.toConversation({
      conversationId: props.conversationId,
      event: CHAT_WS_EVENTS.MESSAGE_CREATED,
      payload: props.payload,
    });
  }

  messageDelivered(props: ConversationEvent): void {
    this.toConversation({
      conversationId: props.conversationId,
      event: CHAT_WS_EVENTS.MESSAGE_DELIVERED,
      payload: props.payload,
    });
  }

  messageRead(props: ConversationEvent): void {
    this.toConversation({
      conversationId: props.conversationId,
      event: CHAT_WS_EVENTS.MESSAGE_READ,
      payload: props.payload,
    });
  }

  typing(props: ConversationEvent): void {
    this.toConversation({
      conversationId: props.conversationId,
      event: CHAT_WS_EVENTS.TYPING,
      payload: props.payload,
    });
  }

  conversationOpened(props: AudienceEvent): void {
    this.emitToUsersAndDrivers({
      userIds: props.userIds,
      driverIds: props.driverIds,
      event: CHAT_WS_EVENTS.CONVERSATION_OPENED,
      payload: props.payload,
    });
  }

  conversationClosed(props: AudienceEvent): void {
    this.emitToUsersAndDrivers({
      userIds: props.userIds,
      driverIds: props.driverIds,
      event: CHAT_WS_EVENTS.CONVERSATION_CLOSED,
      payload: props.payload,
    });
  }

  async joinUsersToConversation(props: JoinConversation): Promise<void> {
    if (!this.websocket.isReady()) {
      return;
    }
    const room = chatRoom(props.conversationId);
    for (const userId of props.userIds) {
      await this.websocket.setRoomMembership({
        from: userRoom(userId),
        room,
        join: true,
      });
    }
  }

  async leaveUsersFromConversation(props: LeaveConversation): Promise<void> {
    if (!this.websocket.isReady()) {
      return;
    }
    const room = chatRoom(props.conversationId);
    for (const userId of props.userIds) {
      await this.websocket.setRoomMembership({
        from: userRoom(userId),
        room,
        join: false,
      });
    }
  }

  async listUserIdsInConversation(conversationId: string): Promise<string[]> {
    return this.websocket.listRoomUserIds(chatRoom(conversationId));
  }

  async isUserInConversation(props: UserInConversation): Promise<boolean> {
    const userIds = await this.listUserIdsInConversation(props.conversationId);
    return userIds.includes(props.userId);
  }

  private emitToUsersAndDrivers(props: EmitToAudience): void {
    if (!this.websocket.isReady()) {
      return;
    }
    for (const userId of props.userIds) {
      this.websocket.broadcastToRoom({
        room: userRoom(userId),
        event: props.event,
        payload: props.payload,
      });
    }
    for (const driverId of props.driverIds) {
      this.websocket.broadcastToRoom({
        room: driverRoom(driverId),
        event: props.event,
        payload: props.payload,
      });
    }
  }
}
