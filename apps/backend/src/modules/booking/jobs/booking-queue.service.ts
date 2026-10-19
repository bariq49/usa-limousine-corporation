import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Job } from "bullmq";
import { AppLogger } from "../../../common/logger/app.logger";
import { BaseQueueService } from "../../../infrastructure/queue/base-queue.service";
import { QueueRegistry } from "../../../infrastructure/queue/queue-registry";
import { BOOKING_JOB_NAMES, BOOKING_QUEUE_NAME, SWEEP_MS } from "../constants/booking.constants";
import { SettingsRepository } from "../../settings/repositories/settings.repository";
import { OFFER_QUEUE_JOBS } from "../constants/offer.constants";
import type {
  MatchDispatchJob,
  OfferExpireJob,
  PaymentTimeoutJob,
  RadiusExpandJob,
  SessionExpireJob,
} from "../types/offer";
import { MatchingService } from "../services/matching.service";
import { OfferService } from "../services/offer.service";

@Injectable()
export class BookingQueueService extends BaseQueueService {
  constructor(
    @Inject(ConfigService) configService: ConfigService,
    @Inject(AppLogger) logger: AppLogger,
    @Inject(QueueRegistry) registry: QueueRegistry,
    @Inject(forwardRef(() => MatchingService)) private readonly matching: MatchingService,
    @Inject(forwardRef(() => OfferService)) private readonly offers: OfferService,
    @Inject(SettingsRepository) private readonly settings: SettingsRepository,
  ) {
    super(configService, logger, registry);
  }

  protected getQueueName() {
    return BOOKING_QUEUE_NAME;
  }

  protected getQueueLabel() {
    return "Booking queue";
  }

  protected async processJob(job: Job) {
    if (job.name === BOOKING_JOB_NAMES.EXPIRE_SWEEP) {
      await this.offers.sweepExpired();
      return;
    }
    if (job.name === BOOKING_JOB_NAMES.PAYMENT_TIMEOUT) {
      const data = job.data as PaymentTimeoutJob;
      await this.offers.expirePayment(data.bookingId);
      return;
    }
    if (
      job.name === BOOKING_JOB_NAMES.MATCH_DISPATCH ||
      job.name === OFFER_QUEUE_JOBS.MATCH_DISPATCH
    ) {
      const data = job.data as MatchDispatchJob;
      const matched = await this.matching.dispatch(data.bookingId);
      if (matched.length === 0) {
        const offerCfg = await this.settings.getOfferMarketplace();
        await this.enqueueRadiusExpand(data.bookingId, offerCfg.radius, 20_000);
      }
      return;
    }
    if (job.name === BOOKING_JOB_NAMES.OFFER_EXPIRE || job.name === OFFER_QUEUE_JOBS.OFFER_EXPIRE) {
      const data = job.data as OfferExpireJob;
      await this.offers.expireOffer(data.offerId);
      return;
    }
    if (
      job.name === BOOKING_JOB_NAMES.SESSION_EXPIRE ||
      job.name === OFFER_QUEUE_JOBS.SESSION_EXPIRE
    ) {
      const data = job.data as SessionExpireJob;
      await this.offers.expireSession(data.bookingId);
      return;
    }
    if (
      job.name === BOOKING_JOB_NAMES.RADIUS_EXPAND ||
      job.name === OFFER_QUEUE_JOBS.RADIUS_EXPAND
    ) {
      const data = job.data as RadiusExpandJob;
      await this.offers.expandRadius(data.bookingId, data.radius);
    }
  }

  protected override async afterQueueStart() {
    const names = [BOOKING_JOB_NAMES.EXPIRE_SWEEP] as const;
    await this.scheduleJobs(names.map((name) => ({ name, everyMs: SWEEP_MS })));
  }

  enqueueMatchDispatch(bookingId: string) {
    return this.addJob(BOOKING_JOB_NAMES.MATCH_DISPATCH, { bookingId } satisfies MatchDispatchJob, {
      jobId: `match-${bookingId}`,
      removeOnComplete: 50,
      removeOnFail: 50,
      attempts: 3,
      backoff: { type: "exponential", delay: 1000 },
    });
  }

  enqueueOfferExpire(offerId: string, expiresAt: Date) {
    const delay = Math.max(0, expiresAt.getTime() - Date.now());
    return this.addJob(BOOKING_JOB_NAMES.OFFER_EXPIRE, { offerId } satisfies OfferExpireJob, {
      jobId: `expire-offer-${offerId}`,
      delay,
      removeOnComplete: 50,
      removeOnFail: 20,
    });
  }

  enqueueSessionExpire(bookingId: string, expiresAt: Date) {
    const delay = Math.max(0, expiresAt.getTime() - Date.now());
    return this.addJob(BOOKING_JOB_NAMES.SESSION_EXPIRE, { bookingId } satisfies SessionExpireJob, {
      jobId: `expire-session-${bookingId}`,
      delay,
      removeOnComplete: 50,
      removeOnFail: 20,
    });
  }

  enqueueRadiusExpand(bookingId: string, radius: number, delayMs: number) {
    return this.addJob(
      BOOKING_JOB_NAMES.RADIUS_EXPAND,
      { bookingId, radius } satisfies RadiusExpandJob,
      {
        jobId: `expand-${bookingId}-${radius}`,
        delay: delayMs,
        removeOnComplete: 20,
        removeOnFail: 20,
      },
    );
  }

  enqueuePaymentTimeout(bookingId: string, timeoutMin: number) {
    const delay = Math.max(0, timeoutMin * 60_000);
    return this.addJob(
      BOOKING_JOB_NAMES.PAYMENT_TIMEOUT,
      { bookingId } satisfies PaymentTimeoutJob,
      {
        jobId: `payment-timeout-${bookingId}`,
        delay,
        removeOnComplete: 50,
        removeOnFail: 20,
      },
    );
  }
}
