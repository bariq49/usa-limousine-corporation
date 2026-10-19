import { Inject, Injectable } from "@nestjs/common";
import { FirebaseService } from "../../../infrastructure/firebase/firebase.service";
import type { FcmError, TestPush, TestPushResult } from "../types/test-push";

@Injectable()
export class TestPushService {
  constructor(@Inject(FirebaseService) private readonly firebase: FirebaseService) {}

  async test(params: TestPush): Promise<TestPushResult> {
    const { token } = params;

    if (!this.firebase.isConfigured()) {
      return {
        ok: false,
        firebase: false,
        error: "Firebase is not configured",
      };
    }

    try {
      const { messageId } = await this.firebase.send({
        token,
        notification: {
          title: "Test notification",
          body: "Push is working",
        },
        data: {
          type: "TEST",
        },
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
                title: "Test notification",
                body: "Push is working",
              },
              sound: "default",
            },
          },
        },
      });

      return {
        ok: true,
        firebase: true,
        messageId,
      };
    } catch (error) {
      const { message, code } = error as FcmError;
      const result: TestPushResult = {
        ok: false,
        firebase: true,
        error: message ?? String(error),
      };
      if (code) {
        result.code = code;
      }
      return result;
    }
  }
}
