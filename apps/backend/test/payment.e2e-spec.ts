import { type INestApplication } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import { BookingStatus, PaymentPurpose, PaymentStatus } from "@prisma/client";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { configureApp } from "../src/bootstrap/configure-app";
import { API_PREFIX, API_VERSION } from "../src/config/api.constants";
import { PrismaService } from "../src/infrastructure/database/prisma.service";
import { AuthEmailService } from "../src/modules/auth/services/auth-email.service";
import { AuthEmailQueueService } from "../src/modules/auth/jobs/auth-email-queue.service";
import { DriverEmailService } from "../src/modules/driver/services/driver-email.service";
import { DriverEmailQueueService } from "../src/modules/driver/jobs/driver-email-queue.service";
import {
  buildBookingPayload,
  cleanupBookingAndTripTables,
  seedBookingFixtures,
} from "./helpers/booking-fixtures";
import { cleanupPaymentTables, cleanupWalletTables } from "./helpers/cleanup-payment";
import {
  authEmailServiceMock,
  driverEmailServiceMock,
  emailQueueLifecycleMock,
} from "./helpers/email-mocks";
import { stripeCheckoutMock } from "./helpers/stripe-mock";

const basePath = `/${API_PREFIX}/v${API_VERSION}`;

describe("Payment checkout (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(AuthEmailService)
      .useValue(authEmailServiceMock)
      .overrideProvider(AuthEmailQueueService)
      .useValue(emailQueueLifecycleMock)
      .overrideProvider(DriverEmailService)
      .useValue(driverEmailServiceMock)
      .overrideProvider(DriverEmailQueueService)
      .useValue(emailQueueLifecycleMock)
      .overrideProvider(stripeCheckoutMock.provide)
      .useValue(stripeCheckoutMock.useValue)
      .compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();

    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    await cleanupWalletTables(prisma);
    await cleanupPaymentTables(prisma);
    await cleanupBookingAndTripTables(prisma);
    await prisma.auditLog.deleteMany();
  });

  afterAll(async () => {
    await cleanupWalletTables(prisma);
    await cleanupPaymentTables(prisma);
    await cleanupBookingAndTripTables(prisma);
    await prisma.auditLog.deleteMany();
    await app.close();
  });

  it("creates a checkout session for a valid booking payment", async () => {
    const fixtures = await seedBookingFixtures(prisma);
    const stamp = Date.now();
    const payload = buildBookingPayload(fixtures);

    const booking = await prisma.booking.create({
      data: {
        vehicleCategoryId: fixtures.vehicleCategoryId,
        bookingNumber: `BK-PAY-${stamp}`,
        status: BookingStatus.PENDING,
        bookingType: "ONE_WAY",
        pricing: { total: 55.55 },
        address: payload.address,
        passenger: payload.passenger,
        bookingTime: payload.bookingTime,
      },
    });

    const response = await request(app.getHttpServer())
      .post(`${basePath}/payments/checkout`)
      .send({
        purpose: PaymentPurpose.BOOKING,
        referenceId: booking.id,
        amount: 55.55,
        description: `Booking ${booking.bookingNumber}`,
        successUrl: "http://localhost:3001/success",
        cancelUrl: "http://localhost:3001/cancel",
      })
      .expect(201);

    expect(response.body.data.checkoutUrl).toContain("checkout.stripe.com");
    expect(response.body.data.sessionId).toBe("cs_test_e2e");

    const paymentId = response.body.data.paymentId as string;

    const payment = await prisma.payment.findUnique({
      where: {
        purpose_referenceId: {
          purpose: PaymentPurpose.BOOKING,
          referenceId: booking.id,
        },
      },
    });

    expect(payment?.status).toBe(PaymentStatus.PENDING);
    expect(payment?.amount.toString()).toBe("55.55");

    const status = await request(app.getHttpServer())
      .get(`${basePath}/payments/${paymentId}/status`)
      .expect(200);

    expect(status.body.data).toEqual(
      expect.objectContaining({
        id: paymentId,
        status: PaymentStatus.PENDING,
        purpose: PaymentPurpose.BOOKING,
        referenceId: booking.id,
      }),
    );
  });

  it("rejects checkout when amount does not match booking total", async () => {
    const fixtures = await seedBookingFixtures(prisma);
    const stamp = Date.now();
    const payload = buildBookingPayload(fixtures);

    const booking = await prisma.booking.create({
      data: {
        vehicleCategoryId: fixtures.vehicleCategoryId,
        bookingNumber: `BK-BAD-${stamp}`,
        status: BookingStatus.PENDING,
        bookingType: "ONE_WAY",
        pricing: { total: 55.55 },
        address: payload.address,
        passenger: payload.passenger,
        bookingTime: payload.bookingTime,
      },
    });

    await request(app.getHttpServer())
      .post(`${basePath}/payments/checkout`)
      .send({
        purpose: PaymentPurpose.BOOKING,
        referenceId: booking.id,
        amount: 10,
        description: "Wrong amount",
        successUrl: "http://localhost:3001/success",
        cancelUrl: "http://localhost:3001/cancel",
      })
      .expect(400);
  });

  it("rejects subscription checkout when subscription does not exist", async () => {
    const response = await request(app.getHttpServer())
      .post(`${basePath}/payments/checkout`)
      .send({
        purpose: PaymentPurpose.DRIVER_SUBSCRIPTION,
        referenceId: "sub-1",
        amount: 29.99,
        description: "Driver plan",
        successUrl: "http://localhost:3001/success",
        cancelUrl: "http://localhost:3001/cancel",
      })
      .expect(400);

    expect(response.body.error.message).toMatch(/subscription not found for checkout/i);
  });

  it("returns 404 for unknown payment status", async () => {
    await request(app.getHttpServer())
      .get(`${basePath}/payments/does-not-exist/status`)
      .expect(404);
  });
});
