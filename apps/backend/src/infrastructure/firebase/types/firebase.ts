export type Config = {
  projectId?: string;
  clientEmail?: string;
  privateKey?: string;
};

export type Notification = {
  title: string;
  body: string;
  imageUrl?: string;
};

export type DataPayload = Record<string, string>;

export type Message = {
  token: string;
  notification?: Notification;
  data?: DataPayload;
  android?: {
    priority?: "high" | "normal";
    notification?: {
      channelId?: string;
      sound?: string;
    };
  };
  apns?: {
    headers?: Record<string, string>;
    payload?: {
      aps: {
        alert?: {
          title?: string;
          body?: string;
        };
        sound?: string;
      };
    };
  };
};

export type MulticastMessage = {
  tokens: string[];
  notification?: Notification;
  data?: DataPayload;
  android?: Message["android"];
  apns?: Message["apns"];
};

export type SendResult = {
  messageId: string;
};

export type MulticastResult = {
  successCount: number;
  failureCount: number;
  responses: Array<{
    success: boolean;
    messageId?: string;
    errorCode?: string;
  }>;
};
