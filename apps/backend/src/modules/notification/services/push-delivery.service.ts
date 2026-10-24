import { Inject, Injectable } from "@nestjs/common";
import { AppLogger } from "../../../common/logger/app.logger";
import { isPermanentFcmTokenError } from "../../../infrastructure/firebase/fcm-token-errors";
import { FirebaseService } from "../../../infrastructure/firebase/firebase.service";
import type { Push, PushResult } from "../types/notification";
import { TokenResolverRegistry } from "./push-token-resolver.registry";

@Injectable()
export class PushDeliveryService {
  constructor(
    @Inject(FirebaseService) private readonly firebase: FirebaseService,
    @Inject(TokenResolverRegistry) private readonly pushTokens: TokenResolverRegistry,
    @Inject(AppLogger) private readonly logger: AppLogger,
  ) {}

  async deliver(payload: Push): Promise<PushResult> {
    const result: PushResult = { retryTokens: [] };

    if (!this.firebase.isConfigured()) {
      this.logger.warn("Firebase not configured; skipped push delivery", PushDeliveryService.name);
      return result;
    }

    if (payload.tokens.length === 0) {
      return result;
    }

    const response = await this.firebase.sendEachForMulticast({
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

    if (response.failureCount === 0) {
      this.logger.log(
        `push.delivered tokens=${payload.tokens.length} success=${response.successCount}`,
        PushDeliveryService.name,
      );
    } else {
      this.logger.warn(
        `push.partial_failure tokens=${payload.tokens.length} success=${response.successCount} failure=${response.failureCount}`,
        PushDeliveryService.name,
      );
    }

    const invalidTokens: string[] = [];
    payload.tokens.forEach((token, index) => {
      const sent = response.responses[index];
      if (!sent || sent.success) {
        return;
      }
      if (isPermanentFcmTokenError(sent.errorCode)) {
        invalidTokens.push(token);
      } else {
        result.retryTokens.push(token);
      }
    });

    if (invalidTokens.length === 0) {
      return result;
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

    return result;
  }
}
