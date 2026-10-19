import { Inject, Injectable } from "@nestjs/common";
import { AppLogger } from "../../../common/logger/app.logger";
import { isPermanentFcmTokenError } from "../../../infrastructure/firebase/fcm-token-errors";
import { FirebaseService } from "../../../infrastructure/firebase/firebase.service";
import type { Push } from "../types/notification";
import { TokenResolverRegistry } from "./push-token-resolver.registry";

@Injectable()
export class PushDeliveryService {
  constructor(
    @Inject(FirebaseService) private readonly firebase: FirebaseService,
    @Inject(TokenResolverRegistry) private readonly pushTokens: TokenResolverRegistry,
    @Inject(AppLogger) private readonly logger: AppLogger,
  ) {}

  async deliver(payload: Push) {
    if (!this.firebase.isConfigured()) {
      this.logger.warn("Firebase not configured; skipped push delivery", PushDeliveryService.name);
      return;
    }

    if (payload.tokens.length === 0) {
      return;
    }

    const result = await this.firebase.sendEachForMulticast({
      tokens: payload.tokens,
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: payload.data,
      android: {
        priority: "high",
        notification: {
          channelId: "default",
          sound: "default",
        },
      },
      apns: {
        headers: {
          "apns-priority": "10",
        },
        payload: {
          aps: {
            alert: {
              title: payload.title,
              body: payload.body,
            },
            sound: "default",
          },
        },
      },
    });

    if (result.failureCount === 0) {
      this.logger.log(
        `push.delivered tokens=${payload.tokens.length} success=${result.successCount}`,
        PushDeliveryService.name,
      );
    } else {
      this.logger.warn(
        `push.partial_failure tokens=${payload.tokens.length} success=${result.successCount} failure=${result.failureCount}`,
        PushDeliveryService.name,
      );
    }

    const invalidTokens = payload.tokens.filter((_token, index) => {
      const response = result.responses[index];
      return response !== undefined && isPermanentFcmTokenError(response.errorCode);
    });

    if (invalidTokens.length === 0) {
      return;
    }

    try {
      const cleared = await this.pushTokens.invalidateAll(invalidTokens);
      this.logger.warn(
        `push.tokens_invalidated requested=${invalidTokens.length} cleared=${cleared}`,
        PushDeliveryService.name,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to clear invalid FCM token(s): ${message}`,
        PushDeliveryService.name,
      );
    }
  }
}
