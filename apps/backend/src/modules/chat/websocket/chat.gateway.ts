import { Inject } from "@nestjs/common";
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from "@nestjs/websockets";
import { chatRoom } from "../../../infrastructure/websocket/constants/rooms";
import { WebsocketService } from "../../../infrastructure/websocket/websocket.service";
import { CHAT_WS_EVENTS } from "../constants/chat.constants";
import { ChatService } from "../services/chat.service";
import type {
  Ack,
  AuthedSocket,
  JoinBody,
  Message,
  MessageAckBody,
  SendBody,
  TypingBody,
} from "../types/chat";

@WebSocketGateway({ namespace: "/" })
export class ChatGateway {
  constructor(
    @Inject(ChatService) private readonly chat: ChatService,
    @Inject(WebsocketService) private readonly websocket: WebsocketService,
  ) {}

  @SubscribeMessage(CHAT_WS_EVENTS.JOIN)
  async onJoin(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() body: JoinBody,
  ): Promise<Ack<{ conversationId: string }>> {
    const userId = this.userId(client);
    if (!userId) {
      return { ok: false, error: "Unauthorized" };
    }
    try {
      const conversationId = body?.conversationId;
      if (!conversationId) {
        return { ok: false, error: "conversationId required" };
      }
      await this.chat.openConversation(conversationId, userId);
      await this.websocket.joinClientRooms(client, [chatRoom(conversationId)]);
      return { ok: true, payload: { conversationId } };
    } catch (error) {
      return { ok: false, error: this.errorMessage(error, "Join failed") };
    }
  }

  @SubscribeMessage(CHAT_WS_EVENTS.MESSAGE_SEND)
  async onSend(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() body: SendBody,
  ): Promise<Ack<Message>> {
    const userId = this.userId(client);
    if (!userId) {
      return { ok: false, error: "Unauthorized" };
    }
    try {
      if (!body?.conversationId || !body?.body) {
        return { ok: false, error: "conversationId and body required" };
      }
      const message = await this.chat.sendForUser({
        conversationId: body.conversationId,
        senderUserId: userId,
        body: body.body,
        clientMessageId: body.clientMessageId ?? null,
        replyToMessageId: body.replyToMessageId ?? null,
      });
      return { ok: true, payload: message };
    } catch (error) {
      return { ok: false, error: this.errorMessage(error, "Send failed") };
    }
  }

  @SubscribeMessage(CHAT_WS_EVENTS.MESSAGE_DELIVERED)
  async onDelivered(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() body: MessageAckBody,
  ): Promise<Ack<{ ok: true }>> {
    const userId = this.userId(client);
    if (!userId) {
      return { ok: false, error: "Unauthorized" };
    }
    try {
      if (!body?.conversationId || !body?.messageId) {
        return { ok: false, error: "conversationId and messageId required" };
      }
      await this.chat.markDelivered({
        conversationId: body.conversationId,
        userId,
        messageId: body.messageId,
      });
      return { ok: true, payload: { ok: true } };
    } catch (error) {
      return { ok: false, error: this.errorMessage(error, "Delivered failed") };
    }
  }

  @SubscribeMessage(CHAT_WS_EVENTS.TYPING)
  async onTyping(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() body: TypingBody,
  ): Promise<Ack<{ ok: true }>> {
    const userId = this.userId(client);
    if (!userId) {
      return { ok: false, error: "Unauthorized" };
    }
    try {
      if (!body?.conversationId) {
        return { ok: false, error: "conversationId required" };
      }
      await this.chat.typing({
        conversationId: body.conversationId,
        userId,
        isTyping: body.isTyping !== false,
      });
      return { ok: true, payload: { ok: true } };
    } catch (error) {
      return { ok: false, error: this.errorMessage(error, "Typing failed") };
    }
  }

  private userId(client: AuthedSocket): string | undefined {
    return client.data.user?.userId;
  }

  private errorMessage(error: unknown, fallback: string): string {
    return error instanceof Error ? error.message : fallback;
  }
}
