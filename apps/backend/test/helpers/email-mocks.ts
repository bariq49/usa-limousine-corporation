import { AuthEmailService } from "../../src/modules/auth/services/auth-email.service";
import { AuthEmailQueueService } from "../../src/modules/auth/jobs/auth-email-queue.service";
import { DriverEmailService } from "../../src/modules/driver/services/driver-email.service";
import { DriverEmailQueueService } from "../../src/modules/driver/jobs/driver-email-queue.service";

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

export const driverEmailServiceMock = {
  sendApplicationStatusEmail: async () => undefined,
  sendApplicationReceivedEmails: async () => undefined,
  sendDriverCredentialsEmail: async () => undefined,
};

export { AuthEmailService, AuthEmailQueueService, DriverEmailService, DriverEmailQueueService };
