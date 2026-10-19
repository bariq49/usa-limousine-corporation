import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../../infrastructure/database/prisma.service";
import { EmailService } from "../../infrastructure/email/email.service";
import { probeBullMqHealth } from "../../infrastructure/queue/queue-health";
import { QueueRegistry, type QueueMetric } from "../../infrastructure/queue/queue-registry";
import { RedisService } from "../../infrastructure/redis/redis.service";
import { StorageService } from "../../infrastructure/storage/storage.service";
import { FirebaseService } from "../../infrastructure/firebase/firebase.service";
import { StripeService } from "../../infrastructure/stripe/stripe.service";
import { AgoraService } from "../../infrastructure/agora/agora.service";
import { TwilioService } from "../../infrastructure/twilio/twilio.service";
import { WebsocketService } from "../../infrastructure/websocket/websocket.service";
import type { DependencyStatus, HealthStatus } from "./health.types";

const HEALTH_CHECK_TIMEOUT_MS = 3_000;

@Injectable()
export class HealthService {
  constructor(
    @Inject(ConfigService) private readonly configService: ConfigService,
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(RedisService) private readonly redis: RedisService,
    @Inject(QueueRegistry) private readonly queueRegistry: QueueRegistry,
    @Inject(StorageService) private readonly storage: StorageService,
    @Inject(EmailService) private readonly email: EmailService,
    @Inject(WebsocketService) private readonly websocket: WebsocketService,
    @Inject(StripeService) private readonly stripe: StripeService,
    @Inject(FirebaseService) private readonly firebase: FirebaseService,
    @Inject(TwilioService) private readonly twilio: TwilioService,
    @Inject(AgoraService) private readonly agora: AgoraService,
  ) {}

  async getHealth(): Promise<HealthStatus> {
    const [database, redis, queue, storage, email, websocket, stripe, firebase, twilio, agora] =
      await Promise.all([
        this.checkDatabase(),
        this.checkRedis(),
        this.checkQueue(),
        this.checkStorage(),
        this.checkEmail(),
        this.checkWebsocket(),
        this.checkStripe(),
        this.checkFirebase(),
        this.checkTwilio(),
        this.checkAgora(),
      ]);

    const requiredStatuses = [database, redis, queue, storage, email, websocket];
    const requiredDown = requiredStatuses.some((status) => status === "down");
    const status = !requiredDown ? "ok" : ("degraded" as const);

    return {
      status,
      database,
      redis,
      queue,
      storage,
      email,
      websocket,
      stripe,
      firebase,
      twilio,
      agora,
    };
  }

  async getQueueMetrics(): Promise<QueueMetric[]> {
    return this.queueRegistry.getMetrics();
  }

  private async checkDatabase(): Promise<"up" | "down"> {
    try {
      await this.withTimeout(this.prisma.$queryRaw`SELECT 1`);
      return "up";
    } catch {
      return "down";
    }
  }

  private async checkRedis(): Promise<DependencyStatus> {
    if (!this.redis.isConfigured()) {
      return "not_configured";
    }

    try {
      await this.withTimeout(this.redis.ping());
      return "up";
    } catch {
      return "down";
    }
  }

  private async checkQueue(): Promise<DependencyStatus> {
    if (!this.redis.isConfigured()) {
      return "not_configured";
    }

    try {
      const ok = await this.withTimeout(probeBullMqHealth(this.configService));
      return ok ? "up" : "down";
    } catch {
      return "down";
    }
  }

  private async checkStorage(): Promise<DependencyStatus> {
    if (!this.storage.isConfigured()) {
      return "not_configured";
    }

    try {
      const ok = await this.withTimeout(this.storage.ping());
      return ok ? "up" : "down";
    } catch {
      return "down";
    }
  }

  private async checkEmail(): Promise<DependencyStatus> {
    if (!this.email.isConfigured()) {
      return "not_configured";
    }

    try {
      const ok = await this.withTimeout(this.email.verify());
      return ok ? "up" : "down";
    } catch {
      return "down";
    }
  }

  private async checkWebsocket(): Promise<DependencyStatus> {
    return this.websocket.isReady() ? "up" : "down";
  }

  private async checkStripe(): Promise<DependencyStatus> {
    if (!this.stripe.isConfigured()) {
      return "not_configured";
    }

    try {
      const ok = await this.withTimeout(this.stripe.healthCheck());
      return ok ? "up" : "down";
    } catch {
      return "down";
    }
  }

  private async checkFirebase(): Promise<DependencyStatus> {
    if (!this.firebase.isConfigured()) {
      return "not_configured";
    }

    try {
      const ok = await this.withTimeout(this.firebase.healthCheck());
      return ok ? "up" : "down";
    } catch {
      return "down";
    }
  }

  private async checkTwilio(): Promise<DependencyStatus> {
    if (!this.twilio.isConfigured()) {
      return "not_configured";
    }

    try {
      const ok = await this.withTimeout(this.twilio.healthCheck());
      return ok ? "up" : "down";
    } catch {
      return "down";
    }
  }

  private async checkAgora(): Promise<DependencyStatus> {
    if (!this.agora.isConfigured()) {
      return "not_configured";
    }

    try {
      return this.agora.healthCheck() ? "up" : "down";
    } catch {
      return "down";
    }
  }

  private withTimeout<T>(promise: Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new Error("Health check timed out")),
        HEALTH_CHECK_TIMEOUT_MS,
      );

      promise.then(resolve, reject).finally(() => clearTimeout(timer));
    });
  }
}
