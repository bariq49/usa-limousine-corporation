import { Inject, Injectable, Logger, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  cert,
  getApp,
  getApps,
  initializeApp,
  type App,
  type AppOptions,
} from "firebase-admin/app";
import {
  getMessaging,
  type Messaging,
  type MulticastMessage as FcmMulticastMessage,
  type TokenMessage,
} from "firebase-admin/messaging";
import { getFirebaseConfig, isFirebaseConfigComplete } from "./firebase.config";
import type { Message, MulticastMessage, MulticastResult } from "./types/firebase";

const FIREBASE_APP_NAME = "usa-limousine-corporation";

@Injectable()
export class FirebaseService {
  private readonly logger = new Logger(FirebaseService.name);
  private readonly app: App | null;
  private readonly messaging: Messaging | null;

  constructor(@Inject(ConfigService) configService: ConfigService) {
    const config = getFirebaseConfig(configService);

    if (!isFirebaseConfigComplete(config)) {
      this.logger.warn(
        "Firebase FCM disabled: set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY",
      );
      this.app = null;
      this.messaging = null;
      return;
    }

    try {
      const projectId = config.projectId;
      const clientEmail = config.clientEmail;
      const privateKey = config.privateKey;

      const options: AppOptions = {
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        projectId,
      };

      this.app = getApps().some((app) => app.name === FIREBASE_APP_NAME)
        ? getApp(FIREBASE_APP_NAME)
        : initializeApp(options, FIREBASE_APP_NAME);
      this.messaging = getMessaging(this.app);
      this.logger.log(`Firebase FCM ready (project=${projectId})`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Firebase FCM init failed: ${message}`);
      this.app = null;
      this.messaging = null;
    }
  }

  isConfigured(): boolean {
    return this.messaging !== null;
  }

  getMessaging(): Messaging {
    if (!this.messaging) {
      throw new ServiceUnavailableException("Firebase is not configured");
    }
    return this.messaging;
  }

  async send(message: Message) {
    const messaging = this.getMessaging();
    const payload: TokenMessage = { token: message.token };

    if (message.notification) {
      payload.notification = message.notification;
    }
    if (message.data) {
      payload.data = message.data;
    }
    if (message.android) {
      payload.android = message.android;
    }
    if (message.apns) {
      payload.apns = message.apns;
    }

    const messageId = await messaging.send(payload);
    return { messageId };
  }

  async sendEachForMulticast(message: MulticastMessage) {
    const messaging = this.getMessaging();
    if (message.tokens.length === 0) {
      return { successCount: 0, failureCount: 0, responses: [] };
    }

    const payload: FcmMulticastMessage = { tokens: message.tokens };

    if (message.notification) {
      payload.notification = message.notification;
    }
    if (message.data) {
      payload.data = message.data;
    }
    if (message.android) {
      payload.android = message.android;
    }
    if (message.apns) {
      payload.apns = message.apns;
    }

    const result = await messaging.sendEachForMulticast(payload);

    return {
      successCount: result.successCount,
      failureCount: result.failureCount,
      responses: result.responses.map((response) => {
        const item: MulticastResult["responses"][number] = {
          success: response.success,
        };
        if (response.messageId) {
          item.messageId = response.messageId;
        }
        if (response.error?.code) {
          item.errorCode = response.error.code;
        }
        return item;
      }),
    };
  }

  async healthCheck(): Promise<boolean> {
    if (!this.messaging || !this.app) {
      return false;
    }

    try {
      return Boolean(this.app.options.projectId);
    } catch {
      return false;
    }
  }
}
