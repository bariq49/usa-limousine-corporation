import { type INestApplication } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import { BookingStatus, RoleKey, TripStatus } from "@prisma/client";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { configureApp } from "../src/bootstrap/configure-app";
import { API_PREFIX, API_VERSION } from "../src/config/api.constants";
import { PrismaService } from "../src/infrastructure/database/prisma.service";
import { AuthEmailService } from "../src/modules/auth/services/auth-email.service";
import { AuthEmailQueueService } from "../src/modules/auth/jobs/auth-email-queue.service";
import { DriverEmailService } from "../src/modules/driver/services/driver-email.service";
import { DriverEmailQueueService } from "../src/modules/driver/jobs/driver-email-queue.service";
import { APPROVED_DRIVER_PASSWORD, createApprovedOrgDriver } from "./helpers/approved-driver";
import {
  buildBookingPayload,
  cleanupBookingAndTripTables,
  seedBookingFixtures,
} from "./helpers/booking-fixtures";
import { cleanupPaymentTables, cleanupWalletTables } from "./helpers/cleanup-payment";
import {
  cleanupSubscriptionTables,
  seedActiveDriverSubscription,
} from "./helpers/driver-subscription";
import {
  authEmailServiceMock,
  driverEmailServiceMock,
  emailQueueLifecycleMock,
} from "./helpers/email-mocks";
import { registerAndVerifyEmail } from "./helpers/register-and-verify";
import { stripeCheckoutMock } from "./helpers/stripe-mock";

const basePath = `/${API_PREFIX}/v${API_VERSION}`;

describe("Trip (e2e)", () => {
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
    await cleanupSubscriptionTables(prisma);
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
    await cleanupSubscriptionTables(prisma);
    await cleanupBookingAndTripTables(prisma);
    await prisma.driverDocument.deleteMany();
    await prisma.driverVehicle.deleteMany();
    await prisma.driver.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.session.deleteMany();
    await prisma.userRole.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });

  async function login(
    email: string,
    password = "Password123!",
    deviceId = "trip-e2e",
  ): Promise<string> {
    const response = await request(app.getHttpServer())
      .post(`${basePath}/auth/login`)
      .set("x-device-id", deviceId)
      .send({ email, password })
      .expect(200);

    return response.body.data.accessToken as string;
  }

  async function promoteToSuperAdmin(email: string): Promise<void> {
    const user = await prisma.user.findUniqueOrThrow({ where: { email } });
    const role = await prisma.role.findUniqueOrThrow({ where: { key: RoleKey.SUPER_ADMIN } });
    await prisma.userRole.create({ data: { userId: user.id, roleId: role.id } });
  }

  it("accepts a confirmed booking and advances trip status to completed", async () => {
    const stamp = Date.now();
    const fixtures = await seedBookingFixtures(prisma);

    const customerEmail = `trip-customer-${stamp}@example.com`;
    await registerAndVerifyEmail({ app, prisma, email: customerEmail });
    const customerToken = await login(customerEmail, "Password123!", `customer-${stamp}`);

    const bookingRes = await request(app.getHttpServer())
      .post(`${basePath}/customers/bookings`)
      .set("Authorization", `Bearer ${customerToken}`)
      .send(buildBookingPayload(fixtures, { passengerEmail: customerEmail }))
      .expect(201);

    const bookingId = bookingRes.body.data.id as string;

    const adminEmail = `trip-admin-${stamp}@example.com`;
    await registerAndVerifyEmail({ app, prisma, email: adminEmail });
    await promoteToSuperAdmin(adminEmail);
    const adminToken = await login(adminEmail, "Password123!", `admin-${stamp}`);

    await request(app.getHttpServer())
      .post(`${basePath}/admin/bookings/${bookingId}/confirm`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(201);

    const driverEmail = `trip-driver-${stamp}@example.com`;

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
        licensePlate: `TR-${stamp}`,
      },
    });

    const driverToken = await login(driverEmail, APPROVED_DRIVER_PASSWORD, `driver-${stamp}`);

    await request(app.getHttpServer())
      .patch(`${basePath}/drivers/presence`)
      .set("Authorization", `Bearer ${driverToken}`)
      .send({
        online: true,
        deviceId: `driver-${stamp}`,
        lat: 52.3702,
        lng: 4.8952,
      })
      .expect(200);

    const tripCreated = await request(app.getHttpServer())
      .post(`${basePath}/trips`)
      .set("Authorization", `Bearer ${driverToken}`)
      .send({ bookingId })
      .expect(201);

    expect(tripCreated.body.data.status).toBe(TripStatus.ACCEPTED);
    const tripId = tripCreated.body.data.id as string;

    const steps = [
      { path: "start", status: TripStatus.STARTED },
      { path: "arrived-at-pickup", status: TripStatus.ARRIVED_AT_PICKUP },
      { path: "passenger-on-board", status: TripStatus.PASSENGER_ON_BOARD },
      { path: "en-route-to-dropoff", status: TripStatus.EN_ROUTE_TO_DROPOFF },
      { path: "arrived-at-dropoff", status: TripStatus.ARRIVED_AT_DROPOFF },
      { path: "complete", status: TripStatus.COMPLETED },
    ];

    for (const step of steps) {
      const updated = await request(app.getHttpServer())
        .post(`${basePath}/trips/${tripId}/${step.path}`)
        .set("Authorization", `Bearer ${driverToken}`)
        .expect(201);

      expect(updated.body.data.status).toBe(step.status);
    }

    const booking = await prisma.booking.findUniqueOrThrow({ where: { id: bookingId } });
    expect(booking.status).toBe(BookingStatus.COMPLETED);
    expect(booking.completedAt).toBeTruthy();

    const events = await prisma.tripEvent.findMany({ where: { tripId } });
    expect(events.length).toBeGreaterThanOrEqual(steps.length);
  });
});
