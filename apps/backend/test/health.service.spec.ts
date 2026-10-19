import { Test, type TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../src/infrastructure/database/prisma.service";
import { EmailService } from "../src/infrastructure/email/email.service";
import { QueueRegistry } from "../src/infrastructure/queue/queue-registry";
import { RedisService } from "../src/infrastructure/redis/redis.service";
import { StorageService } from "../src/infrastructure/storage/storage.service";
import { StripeService } from "../src/infrastructure/stripe/stripe.service";
import { FirebaseService } from "../src/infrastructure/firebase/firebase.service";
import { AgoraService } from "../src/infrastructure/agora/agora.service";
import { TwilioService } from "../src/infrastructure/twilio/twilio.service";
import { WebsocketService } from "../src/infrastructure/websocket/websocket.service";
import { HealthService } from "../src/modules/health/health.service";

describe("HealthService", () => {
  it("returns degraded when database is unreachable", async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        {
          provide: ConfigService,
          useValue: { get: () => undefined, getOrThrow: () => "" },
        },
        {
          provide: PrismaService,
          useValue: {
            $queryRaw: async () => {
              throw new Error("connection refused");
            },
          },
        },
        {
          provide: RedisService,
          useValue: { isConfigured: () => false },
        },
        {
          provide: QueueRegistry,
          useValue: { getMetrics: async () => [] },
        },
        {
          provide: StorageService,
          useValue: { isConfigured: () => false },
        },
        {
          provide: EmailService,
          useValue: { isConfigured: () => false },
        },
        {
          provide: WebsocketService,
          useValue: { isReady: () => false },
        },
        {
          provide: StripeService,
          useValue: { isConfigured: () => false },
        },
        {
          provide: FirebaseService,
          useValue: { isConfigured: () => false },
        },
        {
          provide: TwilioService,
          useValue: { isConfigured: () => false },
        },
        {
          provide: AgoraService,
          useValue: { isConfigured: () => false, healthCheck: () => false },
        },
      ],
    }).compile();

    const service = module.get(HealthService);

    await expect(service.getHealth()).resolves.toEqual({
      status: "degraded",
      database: "down",
      redis: "not_configured",
      queue: "not_configured",
      storage: "not_configured",
      email: "not_configured",
      websocket: "down",
      stripe: "not_configured",
      firebase: "not_configured",
      twilio: "not_configured",
      agora: "not_configured",
    });
  });
});
