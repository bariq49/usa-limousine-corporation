import { AuthEmailService } from "../../src/modules/auth/services/auth-email.service";
import { AuthEmailQueueService } from "../../src/modules/auth/jobs/auth-email-queue.service";

/** No-op overrides so e2e does not start Redis workers or send mail. */
export const emailQueueLifecycleMock = {
  onModuleInit: async () => undefined,
  onModuleDestroy: async () => undefined,
  isConfigured: () => false,
};

export const authEmailServiceMock = {
  sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
  sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
};

export { AuthEmailService, AuthEmailQueueService };
