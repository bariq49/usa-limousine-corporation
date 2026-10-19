import { type INestApplication } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import { BookingOfferStatus, BookingStatus, RoleKey, TripStatus } from "@prisma/client";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { configureApp } from "../src/bootstrap/configure-app";
import { API_PREFIX, API_VERSION } from "../src/config/api.constants";
import { PrismaService } from "../src/infrastructure/database/prisma.service";
import { AuthEmailService } from "../src/modules/auth/services/auth-email.service";
import { AuthEmailQueueService } from "../src/modules/auth/jobs/auth-email-queue.service";
import { DriverEmailService } from "../src/modules/driver/services/driver-email.service";
import { DriverEmailQueueService } from "../src/modules/driver/jobs/driver-email-queue.service";
import { BookingQueueService } from "../src/modules/booking/jobs/booking-queue.service";
import { MatchingService } from "../src/modules/booking/services/matching.service";
import { OfferService } from "../src/modules/booking/services/offer.service";
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
import { APPROVED_DRIVER_PASSWORD, createApprovedOrgDriver } from "./helpers/approved-driver";
import { seedActiveDriverSubscription } from "./helpers/driver-subscription";
import { registerAndVerifyEmail } from "./helpers/register-and-verify";
import { stripeCheckoutMock } from "./helpers/stripe-mock";

const basePath = `/${API_PREFIX}/v${API_VERSION}`;

describe("Offer marketplace (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let matching: MatchingService;
  let offers: OfferService;

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
      .overrideProvider(BookingQueueService)
      .useValue({
        onModuleInit: async () => undefined,
        onModuleDestroy: async () => undefined,
        enqueueMatchDispatch: async () => undefined,
        enqueueOfferExpire: async () => undefined,
        enqueueSessionExpire: async () => undefined,
        enqueueRadiusExpand: async () => undefined,
        enqueuePaymentTimeout: async () => undefined,
        isConfigured: () => false,
      })
      .compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();

    prisma = app.get(PrismaService);
    matching = app.get(MatchingService);
    offers = app.get(OfferService);
  });

  beforeEach(async () => {
    await cleanupWalletTables(prisma);
    await cleanupPaymentTables(prisma);
    await cleanupBookingAndTripTables(prisma);
    await prisma.driverDocument.deleteMany();
    await prisma.driverVehicle.deleteMany();
    await prisma.driver.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.session.deleteMany();
    await prisma.userRole.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await cleanupWalletTables(prisma);
    await cleanupPaymentTables(prisma);
    await cleanupBookingAndTripTables(prisma);
    await app.close();
  });

  async function login(email: string, password: string, deviceId: string) {
    const response = await request(app.getHttpServer())
      .post(`${basePath}/auth/login`)
      .set("x-device-id", deviceId)
      .send({ email, password })
      .expect(200);
    return response.body.data.accessToken as string;
  }

  async function promoteToSuperAdmin(email: string) {
    const user = await prisma.user.findUniqueOrThrow({ where: { email } });
    const role = await prisma.role.findUniqueOrThrow({ where: { key: RoleKey.SUPER_ADMIN } });
    await prisma.userRole.create({ data: { userId: user.id, roleId: role.id } });
  }

  it("seek → quote → accept → pay → trip", async () => {
    const stamp = Date.now();
    const fixtures = await seedBookingFixtures(prisma);

    const customerEmail = `pax-${stamp}@example.com`;
    await registerAndVerifyEmail({ app, prisma, email: customerEmail });
    const customerToken = await login(customerEmail, "Password123!", `pax-${stamp}`);

    const created = await request(app.getHttpServer())
      .post(`${basePath}/customers/bookings`)
      .set("Authorization", `Bearer ${customerToken}`)
      .send(buildBookingPayload(fixtures, { passengerEmail: customerEmail }))
      .expect(201);

    expect(created.body.data.status).toBe(BookingStatus.SEEKING_OFFERS);
    const bookingId = created.body.data.id as string;

    const adminEmail = `offer-admin-${stamp}@example.com`;
    await registerAndVerifyEmail({ app, prisma, email: adminEmail });
    await promoteToSuperAdmin(adminEmail);
    const adminToken = await login(adminEmail, "Password123!", `admin-${stamp}`);

    const driverEmail = `offer-driver-${stamp}@example.com`;
    const driver = await createApprovedOrgDriver(app, prisma, {
      adminAccessToken: adminToken,
      email: driverEmail,
    });
    await seedActiveDriverSubscription(prisma, driver.id);
    await prisma.driverVehicle.create({
      data: {
        driverId: driver.id,
        vehicleCategoryId: fixtures.vehicleCategoryId,
        make: "Toyota",
        model: "Camry",
        year: 2022,
        licensePlate: `OF-${stamp}`,
      },
    });
    await prisma.driver.update({
      where: { id: driver.id },
      data: {
        presenceStatus: "ONLINE",
        lastLat: 52.3105,
        lastLng: 4.7683,
        locationUpdatedAt: new Date(),
      },
    });

    const driverToken = await login(driverEmail, APPROVED_DRIVER_PASSWORD, `driver-${stamp}`);
    await matching.dispatch(bookingId, 50);

    const quoted = await request(app.getHttpServer())
      .post(`${basePath}/offers`)
      .set("Authorization", `Bearer ${driverToken}`)
      .send({ bookingId, quotedPrice: 60 })
      .expect(201);

    expect(quoted.body.data.status).toBe(BookingOfferStatus.PENDING);
    const offerId = quoted.body.data.id as string;

    const listed = await request(app.getHttpServer())
      .get(`${basePath}/customers/bookings/${bookingId}/offers`)
      .set("Authorization", `Bearer ${customerToken}`)
      .expect(200);

    expect(listed.body.data).toHaveLength(1);
    expect(listed.body.data[0].quotedPrice).toBe(60);

    const accepted = await request(app.getHttpServer())
      .post(`${basePath}/customers/bookings/offers/${offerId}/accept`)
      .set("Authorization", `Bearer ${customerToken}`)
      .send({
        successUrl: "http://localhost:3001/ok",
        cancelUrl: "http://localhost:3001/cancel",
      })
      .expect(201);

    expect(accepted.body.data.checkoutUrl).toContain("checkout");
    expect(accepted.body.data.quotedPrice).toBe(60);

    const awaiting = await prisma.booking.findUniqueOrThrow({ where: { id: bookingId } });
    expect(awaiting.status).toBe(BookingStatus.AWAITING_PAYMENT);
    expect(awaiting.acceptedOfferId).toBe(offerId);

    // Idempotent re-accept of the same offer resumes checkout (201) instead of failing.
    const second = await request(app.getHttpServer())
      .post(`${basePath}/customers/bookings/offers/${offerId}/accept`)
      .set("Authorization", `Bearer ${customerToken}`)
      .send({
        successUrl: "http://localhost:3001/ok",
        cancelUrl: "http://localhost:3001/cancel",
      })
      .expect(201);
    expect(second.body.data.offerId).toBe(offerId);
    expect(second.body.data.checkoutUrl).toBeTruthy();
    expect(second.body.data.resumed).toBe(true);

    await offers.onMarketplacePaid(bookingId);

    const paid = await prisma.booking.findUniqueOrThrow({ where: { id: bookingId } });
    expect(paid.status).toBe(BookingStatus.CONFIRMED);

    const trip = await prisma.trip.findFirst({ where: { bookingId } });
    expect(trip?.status).toBe(TripStatus.ACCEPTED);
    expect(trip?.driverId).toBe(driver.id);
  });
});
