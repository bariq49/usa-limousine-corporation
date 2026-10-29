import { type INestApplication } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import { AssignmentStatus, RoleKey } from "@prisma/client";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { configureApp } from "../src/bootstrap/configure-app";
import { API_PREFIX, API_VERSION } from "../src/config/api.constants";
import { formatDate } from "../src/common/utils/format-date";
import { PrismaService } from "../src/infrastructure/database/prisma.service";
import { EmailService } from "../src/infrastructure/email/email.service";
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

describe("Drivers (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const sendMail = jest.fn(async () => undefined);

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(AuthEmailService)
      .useValue(authEmailServiceMock)
      .overrideProvider(AuthEmailQueueService)
      .useValue(emailQueueLifecycleMock)
      .overrideProvider(EmailService)
      .useValue({ send: sendMail })
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
    sendMail.mockClear();
  });

  afterAll(async () => {
    await cleanupBookingTables(prisma);
    await prisma.auditLog.deleteMany();
    await prisma.session.deleteMany();
    await prisma.userRole.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });

  async function adminToken(): Promise<string> {
    const email = `driver-admin-${Date.now()}@example.com`;
    await registerAndVerifyEmail({ app, prisma, email });
    const user = await prisma.user.findUniqueOrThrow({ where: { email } });
    const role = await prisma.role.findUniqueOrThrow({ where: { key: RoleKey.SUPER_ADMIN } });
    await prisma.userRole.create({ data: { userId: user.id, roleId: role.id } });

    const response = await request(app.getHttpServer())
      .post(`${basePath}/auth/login`)
      .set("x-device-id", "drivers-e2e")
      .send({ email, password: "Password123!" })
      .expect(200);
    return response.body.data.accessToken as string;
  }

  it("registers drivers, assigns bookings with commission and reports earnings", async () => {
    const token = await adminToken();
    const fixtures = await seedBookingFixtures(prisma);
    const auth = { Authorization: `Bearer ${token}` };

    const created = await request(app.getHttpServer())
      .post(`${basePath}/admin/drivers`)
      .set(auth)
      .send({
        firstName: "Dana",
        lastName: "Driver",
        email: "Dana.Driver@example.com",
        phone: "+17325550100",
        vehicleCategoryId: fixtures.vehicleCategoryId,
        licenseNumber: "NJ-12345",
      })
      .expect(201);
    const driverId = created.body.data.id as string;
    expect(created.body.data.user.email).toBe("dana.driver@example.com");
    expect(created.body.data.status).toBe("ACTIVE");

    const roles = await prisma.userRole.findMany({
      where: { userId: created.body.data.user.id },
      include: { role: true },
    });
    expect(roles.map((row) => row.role.key)).toEqual([RoleKey.DRIVER]);

    await request(app.getHttpServer())
      .post(`${basePath}/admin/drivers`)
      .set(auth)
      .send({
        firstName: "Other",
        lastName: "Person",
        email: "dana.driver@example.com",
        phone: "+17325550101",
        vehicleCategoryId: fixtures.vehicleCategoryId,
      })
      .expect(409);

    const listed = await request(app.getHttpServer())
      .get(`${basePath}/admin/drivers`)
      .query({ search: "Dana", status: "ACTIVE" })
      .set(auth)
      .expect(200);
    expect(listed.body.data.data).toHaveLength(1);

    const booking = await request(app.getHttpServer())
      .post(`${basePath}/customers/bookings`)
      .set(auth)
      .send(buildBookingPayload(fixtures))
      .expect(201);
    const bookingId = booking.body.data.id as string;
    const total = Number(booking.body.data.totalPrice);

    const assigned = await request(app.getHttpServer())
      .post(`${basePath}/admin/bookings/${bookingId}/assignments`)
      .set(auth)
      .send({ driverId, commissionRate: 20, note: "Meet at door 4" })
      .expect(201);
    expect(assigned.body.data.commissionAmount).toBeCloseTo(total * 0.2, 2);
    expect(assigned.body.data.driverAmount).toBeCloseTo(total * 0.8, 2);
    expect(assigned.body.data.driver.user.firstName).toBe("Dana");
    for (let attempt = 0; attempt < 40 && sendMail.mock.calls.length < 3; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({ to: "dana.driver@example.com" }),
    );

    await request(app.getHttpServer())
      .post(`${basePath}/admin/bookings/${bookingId}/assignments`)
      .set(auth)
      .send({ driverId, commissionRate: 25 })
      .expect(201);

    const history = await request(app.getHttpServer())
      .get(`${basePath}/admin/bookings/${bookingId}/assignments`)
      .set(auth)
      .expect(200);
    expect(history.body.data.map((row: { status: string }) => row.status)).toEqual([
      AssignmentStatus.ACTIVE,
      AssignmentStatus.SUPERSEDED,
    ]);

    await request(app.getHttpServer())
      .post(`${basePath}/admin/bookings/${bookingId}/confirm`)
      .set(auth)
      .expect(201);
    const row = await prisma.booking.findUniqueOrThrow({ where: { id: bookingId } });
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        bookingTime: Object.assign({}, row.bookingTime as object, {
          pickupDate: formatDate({ as: "value" }),
        }),
      },
    });

    const stats = await request(app.getHttpServer())
      .get(`${basePath}/admin/drivers/${driverId}/stats`)
      .query({ period: "daily" })
      .set(auth)
      .expect(200);
    expect(stats.body.data.labels).toHaveLength(7);
    expect(stats.body.data.totalRides).toBe(1);
    expect(stats.body.data.rides[6]).toBe(1);
    expect(stats.body.data.totalEarnings).toBeCloseTo(total * 0.75, 2);
    expect(stats.body.data.totalCommission).toBeCloseTo(total * 0.25, 2);

    const dashboard = await request(app.getHttpServer())
      .get(`${basePath}/admin/dashboard`)
      .query({ period: "daily" })
      .set(auth)
      .expect(200);
    expect(dashboard.body.data.labels).toHaveLength(7);
    expect(dashboard.body.data.confirmedBookings).toBe(1);
    expect(dashboard.body.data.bookingSeries.confirmed[6]).toBe(1);
    expect(dashboard.body.data.assignedRides).toBe(1);
    expect(dashboard.body.data.assignmentSeries.rides[6]).toBe(1);
    expect(dashboard.body.data.assignedRideTotal).toBeCloseTo(total, 2);
    expect(dashboard.body.data.totalDriverPayout).toBeCloseTo(total * 0.75, 2);
    expect(dashboard.body.data.activeDrivers).toBe(1);

    const rides = await request(app.getHttpServer())
      .get(`${basePath}/admin/drivers/${driverId}/bookings`)
      .query({ bookingStatus: "CONFIRMED" })
      .set(auth)
      .expect(200);
    expect(rides.body.data.data).toHaveLength(1);
    expect(rides.body.data.data[0].booking.id).toBe(bookingId);

    await request(app.getHttpServer())
      .delete(`${basePath}/admin/drivers/${driverId}`)
      .set(auth)
      .expect(409);

    await request(app.getHttpServer())
      .delete(`${basePath}/admin/bookings/${bookingId}/assignments`)
      .set(auth)
      .expect(200);

    await request(app.getHttpServer())
      .delete(`${basePath}/admin/drivers/${driverId}`)
      .set(auth)
      .expect(200);

    await request(app.getHttpServer())
      .get(`${basePath}/admin/drivers/${driverId}`)
      .set(auth)
      .expect(404);
  });

  it("refuses to assign a cancelled booking or an inactive driver", async () => {
    const token = await adminToken();
    const fixtures = await seedBookingFixtures(prisma);
    const auth = { Authorization: `Bearer ${token}` };

    const driver = await request(app.getHttpServer())
      .post(`${basePath}/admin/drivers`)
      .set(auth)
      .send({
        firstName: "Ina",
        lastName: "Active",
        email: "ina@example.com",
        phone: "+17325550102",
        vehicleCategoryId: fixtures.vehicleCategoryId,
        status: "INACTIVE",
      })
      .expect(201);

    const booking = await request(app.getHttpServer())
      .post(`${basePath}/customers/bookings`)
      .set(auth)
      .send(buildBookingPayload(fixtures))
      .expect(201);
    const bookingId = booking.body.data.id as string;

    await request(app.getHttpServer())
      .post(`${basePath}/admin/bookings/${bookingId}/assignments`)
      .set(auth)
      .send({ driverId: driver.body.data.id, commissionRate: 10 })
      .expect(400);

    await request(app.getHttpServer())
      .patch(`${basePath}/admin/drivers/${driver.body.data.id}`)
      .set(auth)
      .send({ status: "ACTIVE" })
      .expect(200);

    await request(app.getHttpServer())
      .post(`${basePath}/admin/bookings/${bookingId}/cancel`)
      .set(auth)
      .send({ cancellationReason: "Changed plans" })
      .expect(201);

    await request(app.getHttpServer())
      .post(`${basePath}/admin/bookings/${bookingId}/assignments`)
      .set(auth)
      .send({ driverId: driver.body.data.id, commissionRate: 10 })
      .expect(400);

    await request(app.getHttpServer())
      .post(`${basePath}/admin/bookings/${bookingId}/assignments`)
      .set(auth)
      .send({ driverId: driver.body.data.id, commissionRate: 120 })
      .expect(400);
  });
});
