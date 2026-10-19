import type { EventEmitter2 } from "@nestjs/event-emitter";
import { PaymentPurpose, PaymentStatus } from "@prisma/client";
import { OutboxService } from "../src/modules/payment/services/outbox.service";
import { PAYMENT_JOB_NAMES } from "../src/modules/payment/constants/payment.constants";
import { EventsQueueService } from "../src/modules/payment/jobs/events-queue.service";

describe("OutboxService", () => {
  it("emits event and marks outbox published", async () => {
    const publish = jest.fn(async () => undefined);
    const emit = jest.fn();

    const service = Object.create(OutboxService.prototype) as OutboxService;
    Object.assign(service, {
      outbox: {
        findById: async () => ({
          id: "outbox1",
          event: "payment.succeeded",
          payload: {
            id: "pay1",
            purpose: PaymentPurpose.BOOKING,
            referenceId: "book1",
            status: PaymentStatus.SUCCEEDED,
          },
          publishedAt: null,
          createdAt: new Date(),
        }),
        publish,
      },
      eventEmitter: { emit } as unknown as EventEmitter2,
    });

    await service.dispatch("outbox1");

    expect(emit).toHaveBeenCalledWith(
      "payment.succeeded",
      expect.objectContaining({ referenceId: "book1" }),
    );
    expect(publish).toHaveBeenCalledWith("outbox1");
  });

  it("skips already published outbox", async () => {
    const publish = jest.fn(async () => undefined);
    const emit = jest.fn();

    const service = Object.create(OutboxService.prototype) as OutboxService;
    Object.assign(service, {
      outbox: {
        findById: async () => ({
          id: "outbox1",
          event: "payment.succeeded",
          payload: {},
          publishedAt: new Date(),
          createdAt: new Date(),
        }),
        publish,
      },
      eventEmitter: { emit } as unknown as EventEmitter2,
    });

    await service.dispatch("outbox1");

    expect(emit).not.toHaveBeenCalled();
    expect(publish).not.toHaveBeenCalled();
  });

  it("drains stale rows and deletes expired published outbox", async () => {
    const dispatch = jest.fn(async () => undefined);
    const findStale = jest.fn(async () => [{ id: "stale1" }, { id: "stale2" }]);
    const deletePublishedBefore = jest.fn(async () => ({ count: 3 }));

    const service = Object.create(OutboxService.prototype) as OutboxService;
    Object.assign(service, {
      outbox: { findStale, deletePublishedBefore },
      dispatch,
    });

    await service.drain();

    expect(findStale).toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith("stale1");
    expect(dispatch).toHaveBeenCalledWith("stale2");
    expect(deletePublishedBefore).toHaveBeenCalledWith(expect.any(Date));
  });
});

describe("EventsQueueService", () => {
  it("routes drain job to outbox service", async () => {
    const drain = jest.fn(async () => undefined);
    const service = Object.create(EventsQueueService.prototype) as EventsQueueService;
    Object.assign(service, {
      outboxService: { drain },
    });

    await (
      service as unknown as { processJob: (job: { name: string }) => Promise<void> }
    ).processJob({ name: PAYMENT_JOB_NAMES.DRAIN_OUTBOX });

    expect(drain).toHaveBeenCalled();
  });
});
