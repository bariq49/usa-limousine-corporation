export const CHAT_WS_EVENTS = {
  JOIN: "chat.join",
  MESSAGE_SEND: "chat.message.send",
  MESSAGE_CREATED: "chat.message.created",
  MESSAGE_DELIVERED: "chat.message.delivered",
  MESSAGE_READ: "chat.message.read",
  TYPING: "chat.typing",
  CONVERSATION_OPENED: "chat.conversation.opened",
  CONVERSATION_CLOSED: "chat.conversation.closed",
} as const;

export const CHAT_RATE = {
  sendPerUser: 60,
  typingPerUser: 30,
  windowSeconds: 60,
} as const;

export const CHAT_REDIS = {
  rate: (bucket: string, key: string) => `chat:rl:${bucket}:${key}`,
} as const;

export const CHAT_MESSAGE_MAX_LENGTH = 4000;
export const CHAT_HISTORY_DEFAULT_LIMIT = 50;
export const CHAT_HISTORY_MAX_LIMIT = 100;
