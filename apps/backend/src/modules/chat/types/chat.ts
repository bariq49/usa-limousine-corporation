import type {
  ChatMessageType,
  ConversationKind,
  ConversationStatus,
  ConversationSubjectType,
} from "@prisma/client";
import type { Socket } from "socket.io";
import type {
  Payload,
  WebsocketIdentity,
} from "../../../infrastructure/websocket/types/websocket.types";

export type Open = {
  subjectType: ConversationSubjectType;
  subjectId: string;
  participantUserIds: string[];
  kind: ConversationKind | null;
};

export type OpenSubject = {
  subjectType: ConversationSubjectType;
  subjectId: string;
  participantUserIds: string[];
  kind: ConversationKind;
};

export type OpenTrip = {
  tripId: string;
  driverUserId: string;
  customerUserId: string | null;
};

export type Close = {
  subjectType: ConversationSubjectType;
  subjectId: string;
};

export type Send = {
  conversationId: string;
  senderUserId: string;
  body: string;
  clientMessageId: string | null;
  replyToMessageId: string | null;
};

export type Read = {
  conversationId: string;
  userId: string;
  messageId: string;
};

export type Delivered = {
  conversationId: string;
  userId: string;
  messageId: string;
};

export type Typing = {
  conversationId: string;
  userId: string;
  isTyping: boolean;
};

export type ResolveTrip = {
  tripId: string;
  userId: string;
};

export type NotifyOffline = {
  recipients: string[];
  conversationId: string;
  messageId: string;
  subjectType: ConversationSubjectType | null;
  subjectId: string | null;
  preview: string;
};

export type ListForUser = {
  userId: string;
  limit: number;
  cursor: string | null;
};

export type UpdateParticipantRead = {
  conversationId: string;
  userId: string;
  messageId: string;
  readAt: Date;
};

export type FindClientMessage = {
  conversationId: string;
  senderUserId: string;
  clientMessageId: string;
};

export type CreateMessage = {
  conversationId: string;
  senderUserId: string;
  body: string;
  clientMessageId: string | null;
  replyToMessageId: string | null;
  recipientUserIds: string[];
};

export type ListBefore = {
  conversationId: string;
  before: string | null;
  after: string | null;
  limit: number;
};

export type CountUnread = {
  conversationId: string;
  userId: string;
  afterMessageId: string | null;
  afterCreatedAt: Date | null;
};

export type UnreadBatch = {
  userId: string;
  conversationIds: string[];
};

export type ChatRateConsume = {
  bucket: "send" | "typing";
  key: string;
  limit: number;
  windowSeconds?: number;
};

export type UserInConversation = {
  conversationId: string;
  userId: string;
};

export type MarkDelivered = {
  messageId: string;
  userId: string;
  at: Date;
};

export type MarkReadUpTo = {
  conversationId: string;
  userId: string;
  messageId: string;
  at: Date;
};

export type AssertCanSend = {
  subjectType: ConversationSubjectType;
  subjectId: string;
  userId: string;
};

export type MessageRecord = {
  id: string;
  conversationId: string;
  senderUserId: string;
  type: ChatMessageType;
  body: string;
  clientMessageId: string | null;
  replyToMessageId: string | null;
  createdAt: Date;
};

export type ConversationParticipantRecord = {
  userId: string;
  leftAt: Date | null;
};

export type ConversationRecord = {
  id: string;
  kind: ConversationKind;
  subjectType: ConversationSubjectType | null;
  subjectId: string | null;
  status: ConversationStatus;
  activatedAt: Date | null;
  closedAt: Date | null;
  updatedAt: Date;
  createdAt: Date;
  participants: ConversationParticipantRecord[];
};

export type Counterpart = {
  userId: string;
  name: string | null;
  avatar: string | null;
};

export type Message = {
  id: string;
  conversationId: string;
  senderUserId: string;
  type: ChatMessageType;
  body: string;
  clientMessageId: string | null;
  replyToMessageId: string | null;
  createdAt: string;
};

export type Conversation = {
  id: string;
  kind: ConversationKind;
  subjectType: ConversationSubjectType | null;
  subjectId: string | null;
  status: ConversationStatus;
  activatedAt: string | null;
  closedAt: string | null;
  unreadCount: number;
  counterpart: Counterpart | null;
  updatedAt: string;
  createdAt: string;
};

export type SubjectPolicy = {
  assertCanSend(props: AssertCanSend): Promise<void>;
};

export type EmitToConversation = {
  conversationId: string;
  event: string;
  payload: Payload;
};

export type ConversationEvent = {
  conversationId: string;
  payload: Payload;
};

export type AudienceEvent = {
  userIds: string[];
  driverIds: string[];
  payload: Payload;
};

export type JoinConversation = {
  userIds: string[];
  conversationId: string;
};

export type RoomHasOtherUser = {
  conversationId: string;
  excludeUserId: string;
};

export type LeaveConversation = {
  userIds: string[];
  conversationId: string;
};

export type EmitToAudience = {
  userIds: string[];
  driverIds: string[];
  event: string;
  payload: Payload;
};

export type AuthedSocket = Socket & {
  data: {
    user?: WebsocketIdentity;
  };
};

export type AckOk<T> = { ok: true; payload: T };
export type AckErr = { ok: false; error: string };
export type Ack<T> = AckOk<T> | AckErr;

export type JoinBody = {
  conversationId?: string;
};

export type SendBody = {
  conversationId?: string;
  body?: string;
  clientMessageId?: string;
  replyToMessageId?: string;
};

export type MessageAckBody = {
  conversationId?: string;
  messageId?: string;
};

export type TypingBody = {
  conversationId?: string;
  isTyping?: boolean;
};
