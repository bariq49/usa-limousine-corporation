import { type INestApplication } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import { BookingStatus, BookingType, RoleKey } from "@prisma/client";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { configureApp } from "../src/bootstrap/configure-app";
import { API_PREFIX, API_VERSION } from "../src/config/api.constants";
import { PrismaService } from "../src/infrastructure/database/prisma.service";
import { AuthEmailService } from "../src/modules/auth/services/auth-email.service";
import { AuthEmailQueueService } from "../src/modules/auth/jobs/auth-email-queue.service";
import {
  buildBookingPayload,
  cleanupBookingTables,
  seedBookingFixtures,
} from "./helpers/booking-fixtures";
import { authEmailServiceMock, emailQueueLifecycleMock } from "./helpers/email-mocks";
import { registerAndVerifyEmail } from "./helpers/register-and-verify";

const basePath = `/${API_PREFIX}/v${API_VERSION}`;

describe("Booking (e2e)", () => {
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
      .compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();

    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    await cleanupBookingTables(prisma);
    await prisma.auditLog.deleteMany();
    await prisma.session.deleteMany();
    await prisma.userRole.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await cleanupBookingTables(prisma);
    await prisma.auditLog.deleteMany();
    await prisma.session.deleteMany();
    await prisma.userRole.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });

  async function login(email: string, password = "Password123!"): Promise<string> {
    const response = await request(app.getHttpServer())
      .post(`${basePath}/auth/login`)
      .set("x-device-id", "booking-e2e")
      .send({ email, password })
      .expect(200);

    return response.body.data.accessToken as string;
  }

  async function promoteToSuperAdmin(email: string): Promise<void> {
    const user = await prisma.user.findUniqueOrThrow({ where: { email } });
    const role = await prisma.role.findUniqueOrThrow({ where: { key: RoleKey.SUPER_ADMIN } });
    await prisma.userRole.create({ data: { userId: user.id, roleId: role.id } });
  }

  it("estimates vehicles without saving, then saves the chosen vehicle's quote", async () => {
    const fixtures = await seedBookingFixtures(prisma);
    const payload = buildBookingPayload({ vehicleCategoryId: fixtures.vehicleCategoryId });
    const trip = {
      bookingType: payload.bookingType,
      address: payload.address,
      bookingTime: {
        pickupDate: payload.bookingTime.pickupDate,
        pickupTime: payload.bookingTime.pickupTime,
      },
    };

    const estimates = await request(app.getHttpServer())
      .post(`${basePath}/public/quotes/estimates`)
      .send(trip)
      .expect(200);
    const estimate = estimates.body.data.find(
      (option: { vehicleCategory: { id: string } }) =>
        option.vehicleCategory.id === fixtures.vehicleCategoryId,
    );
    expect(estimate.total).toBeGreaterThan(0);
    expect(await prisma.quote.count()).toBe(0);

    const response = await request(app.getHttpServer())
      .post(`${basePath}/public/quotes`)
      .send(Object.assign({ vehicleCategoryId: fixtures.vehicleCategoryId }, trip))
      .expect(200);

    const saved = await prisma.quote.findUniqueOrThrow({ where: { id: response.body.data.id } });
    expect(saved.total.toNumber()).toBe(estimate.total);
  });

  it("downloads a paid booking's receipt as a PDF", async () => {
    const fixtures = await seedBookingFixtures(prisma);
    const payload = buildBookingPayload({ vehicleCategoryId: fixtures.vehicleCategoryId });
    const orderId = `ORDER${Date.now()}`;
    const booking = await prisma.booking.create({
      data: {
        vehicleCategoryId: fixtures.vehicleCategoryId,
        bookingNumber: `BK-R${Date.now()}`,
        status: BookingStatus.CONFIRMED,
        totalPrice: 55.55,
        pricing: { basePrice: 55.55, total: 55.55 },
        address: payload.address,
        passenger: payload.passenger,
        bookingTime: { pickupDate: payload.bookingTime.pickupDate, pickupTime: "14:30" },
        squareOrderId: orderId,
        payment: {
          create: {
            status: "PAID",
            mode: "TEST",
            amount: 55.55,
            squareOrderId: orderId,
            customerName: "John Doe",
            customerEmail: "john@example.com",
            customerPhone: "+31612345678",
            paidAt: new Date(),
          },
        },
      },
    });

    const response = await request(app.getHttpServer())
      .get(`${basePath}/public/bookings/checkout/${orderId}/receipt`)
      .buffer(true)
      .parse((res, callback) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk: Buffer) => chunks.push(chunk));
        res.on("end", () => callback(null, Buffer.concat(chunks)));
      })
      .expect(200);

    expect(response.headers["content-type"]).toBe("application/pdf");
    expect(response.headers["content-disposition"]).toContain(
      `receipt-${booking.bookingNumber}.pdf`,
    );
    expect((response.body as Buffer).subarray(0, 4).toString()).toBe("%PDF");
  });

  it("creates a pending booking as a logged-in customer", async () => {
    const stamp = Date.now();
    const email = `customer-booking-${stamp}@example.com`;
    const fixtures = await seedBookingFixtures(prisma);

    await registerAndVerifyEmail({ app, prisma, email });
    const accessToken = await login(email);
    const user = await prisma.user.findUniqueOrThrow({ where: { email } });

    const created = await request(app.getHttpServer())
      .post(`${basePath}/customers/bookings`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send(buildBookingPayload(fixtures, { passengerEmail: email }))
      .expect(201);

    expect(created.body.data.status).toBe(BookingStatus.PENDING);
    expect(created.body.data.bookingNumber).toMatch(/^BK-/);

    const booking = await prisma.booking.findUnique({
      where: { id: created.body.data.id },
    });
    expect(booking?.userId).toBe(user.id);
    expect(booking?.status).toBe(BookingStatus.PENDING);

    const mine = await request(app.getHttpServer())
      .get(`${basePath}/customers/bookings`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);
    expect(mine.body.data.data).toHaveLength(1);

    const cancelled = await request(app.getHttpServer())
      .post(`${basePath}/customers/bookings/${created.body.data.id}/cancel`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ cancellationReason: "No longer needed" })
      .expect(201);
    expect(cancelled.body.data.status).toBe(BookingStatus.CANCELLED);
  });

  it("creates, lists, confirms, and cancels a booking", async () => {
    const stamp = Date.now();
    const email = `booking-user-${stamp}@example.com`;
    const fixtures = await seedBookingFixtures(prisma);

    await registerAndVerifyEmail({ app, prisma, email });
    await promoteToSuperAdmin(email);
    const accessToken = await login(email);

    const created = await request(app.getHttpServer())
      .post(`${basePath}/customers/bookings`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send(buildBookingPayload(fixtures, { passengerEmail: email }))
      .expect(201);

    expect(created.body.data.status).toBe(BookingStatus.PENDING);
    expect(created.body.data.bookingNumber).toMatch(/^BK-/);

    const bookingId = created.body.data.id as string;

    const listed = await request(app.getHttpServer())
      .get(`${basePath}/admin/bookings`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);

    expect(listed.body.data.data).toHaveLength(1);

    await request(app.getHttpServer())
      .get(`${basePath}/admin/bookings/${bookingId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);

    const confirmed = await request(app.getHttpServer())
      .post(`${basePath}/admin/bookings/${bookingId}/confirm`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(201);

    expect(confirmed.body.data.status).toBe(BookingStatus.CONFIRMED);
    expect(confirmed.body.data.confirmedAt).toBeTruthy();

    const cancelled = await request(app.getHttpServer())
      .post(`${basePath}/admin/bookings/${bookingId}/cancel`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ cancellationReason: "Changed plans" })
      .expect(201);

    expect(cancelled.body.data.status).toBe(BookingStatus.CANCELLED);
    expect(cancelled.body.data.cancellationReason).toBe("Changed plans");
  });

  it("updates and soft deletes a draft booking", async () => {
    const stamp = Date.now();
    const email = `booking-delete-${stamp}@example.com`;
    const fixtures = await seedBookingFixtures(prisma);

    await registerAndVerifyEmail({ app, prisma, email });
    await promoteToSuperAdmin(email);
    const accessToken = await login(email);

    const draft = await prisma.booking.create({
      data: {
        vehicleCategoryId: fixtures.vehicleCategoryId,
        bookingNumber: `BK-DRAFT-${stamp}`,
        bookingType: BookingType.ONE_WAY,
        status: BookingStatus.DRAFT,
        totalPrice: 40,
        pricing: { total: 40 },
        address: {
          pickup: { address: "A" },
          dropoff: { address: "B" },
          distance: 10,
          duration: 20,
        },
        passenger: {
          passengerCount: 1,
          name: "Draft User",
          phone: "+31600000000",
          email,
        },
        bookingTime: {
          pickupDate: "2026-08-25",
          pickupTime: "10:00",
        },
      },
    });

    const updated = await request(app.getHttpServer())
      .patch(`${basePath}/admin/bookings/${draft.id}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        pricing: { basePrice: 60, total: 60 },
      })
      .expect(200);

    expect(updated.body.data.pricing.total).toBe(60);

    await request(app.getHttpServer())
      .delete(`${basePath}/admin/bookings/${draft.id}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);

    await request(app.getHttpServer())
      .get(`${basePath}/admin/bookings/${draft.id}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(404);
  });
});
