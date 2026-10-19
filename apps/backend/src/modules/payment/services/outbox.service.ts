import { Inject, Injectable, forwardRef } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import {
  PAYMENT_OUTBOX_RETENTION_MS,
  PAYMENT_OUTBOX_STALE_MS,
} from "../constants/payment.constants";
import { EventsQueueService } from "../jobs/events-queue.service";
import { OutboxRepository } from "../repositories/outbox.repository";
import type { EventPayload } from "../types/events";

@Injectable()
export class OutboxService {
  constructor(
    @Inject(OutboxRepository) private readonly outbox: OutboxRepository,
    @Inject(EventEmitter2) private readonly eventEmitter: EventEmitter2,
    @Inject(forwardRef(() => EventsQueueService))
    private readonly queue: EventsQueueService,
  ) {}

  async enqueueDispatch(outboxId: string) {
    if (!this.queue.isConfigured()) {
      await this.dispatch(outboxId);
      return;
    }
    await this.queue.enqueueDispatch(outboxId);
  }

  async dispatch(outboxId: string) {
    const row = await this.outbox.findById(outboxId);
    if (!row || row.publishedAt) {
      return;
    }

    const payload = row.payload as EventPayload;
    this.eventEmitter.emit(row.event, payload);
    await this.outbox.publish(outboxId);
  }

  async drain() {
    const olderThan = new Date(Date.now() - PAYMENT_OUTBOX_STALE_MS);
    const stale = await this.outbox.findStale(olderThan);
    for (const row of stale) {
      await this.dispatch(row.id);
    }

    const retainBefore = new Date(Date.now() - PAYMENT_OUTBOX_RETENTION_MS);
    await this.outbox.deletePublishedBefore(retainBefore);
  }
}
