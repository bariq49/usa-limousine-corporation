import { type INestApplication } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import {
  DriverApprovalStatus,
  DriverOnboardingStatus,
  DriverShift,
  DriverStatus,
  RoleKey,
} from "@prisma/client";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { configureApp } from "../src/bootstrap/configure-app";
import { API_PREFIX, API_VERSION } from "../src/config/api.constants";
import { PrismaService } from "../src/infrastructure/database/prisma.service";
import { cleanupPaymentTables } from "./helpers/cleanup-payment";
import { cleanupBookingAndTripTables } from "./helpers/booking-fixtures";
import { AuthEmailService } from "../src/modules/auth/services/auth-email.service";
import { AuthEmailQueueService } from "../src/modules/auth/jobs/auth-email-queue.service";
import { DriverEmailService } from "../src/modules/driver/services/driver-email.service";
import { DriverEmailQueueService } from "../src/modules/driver/jobs/driver-email-queue.service";
import {
  authEmailServiceMock,
  driverEmailServiceMock,
  emailQueueLifecycleMock,
} from "./helpers/email-mocks";

const basePath = `/${API_PREFIX}/v${API_VERSION}`;

async function cleanupBookingTables(prisma: PrismaService): Promise<void> {
  await cleanupBookingAndTripTables(prisma);
}

async function cleanupVehicleTables(_prisma: PrismaService): Promise<void> {
  // Vehicle operational tables removed; category schema only.
}

async function cleanupDriverTables(prisma: PrismaService): Promise<void> {
  await prisma.driverDocument.deleteMany();
  await prisma.driverVehicle.deleteMany();
  await prisma.driver.deleteMany();
}

describe("Driver (e2e)", () => {
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
      .compile();

    app = moduleFixture.createNestApplication({ bufferLogs: true });
    configureApp(app);
    await app.init();

    prisma = app.get(PrismaService);

    await cleanupPaymentTables(prisma);
    await cleanupBookingTables(prisma);
    await cleanupVehicleTables(prisma);
    await cleanupDriverTables(prisma);
    await prisma.auditLog.deleteMany();
    await prisma.session.deleteMany();
    await prisma.emailVerificationToken.deleteMany();
    await prisma.passwordResetToken.deleteMany();
    await prisma.userRole.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await cleanupPaymentTables(prisma);
    await cleanupBookingTables(prisma);
    await cleanupVehicleTables(prisma);
    await cleanupDriverTables(prisma);
    await prisma.auditLog.deleteMany();
    await prisma.session.deleteMany();
    await prisma.emailVerificationToken.deleteMany();
    await prisma.passwordResetToken.deleteMany();
    await prisma.userRole.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });

  async function register(email: string, password = "Password123!"): Promise<void> {
    await request(app.getHttpServer())
      .post(`${basePath}/auth/register`)
      .send({ email, password })
      .expect(201);

    await prisma.user.update({
      where: { email },
      data: { isEmailVerified: true },
    });
  }

  async function login(
    email: string,
    password = "Password123!",
    deviceId = "drv-device",
  ): Promise<{ accessToken: string }> {
    const response = await request(app.getHttpServer())
      .post(`${basePath}/auth/login`)
      .set("x-device-id", deviceId)
      .send({ email, password })
      .expect(200);

    return { accessToken: response.body.data.accessToken as string };
  }

  async function promoteToSuperAdmin(email: string): Promise<void> {
    const user = await prisma.user.findUniqueOrThrow({ where: { email } });
    const role = await prisma.role.findUniqueOrThrow({ where: { key: RoleKey.SUPER_ADMIN } });
    await prisma.userRole.create({ data: { userId: user.id, roleId: role.id } });
  }

  it("creates a public driver application", async () => {
    const stamp = Date.now();
    const driverEmail = `drv-user-${stamp}@example.com`;

    const created = await request(app.getHttpServer())
      .post(`${basePath}/drivers`)
      .send({
        email: driverEmail,
        firstName: "Jane",
        lastName: "Driver",
        phone: `+316${stamp.toString().slice(-8)}`,
      })
      .expect(201);

    expect(created.body.data.applicationNumber).toMatch(/^APP-\d{6}$/);
    expect(created.body.data.email).toBe(driverEmail);
    expect(created.body.data.message).toBe(
      "A verification code has been sent to your email. Please verify to continue.",
    );

    const driver = await prisma.driver.findUniqueOrThrow({
      where: { id: created.body.data.id as string },
    });
    expect(driver.status).toBe(DriverStatus.PENDING);
    expect(driver.approvalStatus).toBe(DriverApprovalStatus.PENDING);

    const roles = await prisma.userRole.findMany({
      where: { userId: driver.userId },
      include: { role: true },
    });
    expect(roles.some((row) => row.role.key === RoleKey.DRIVER)).toBe(true);

    const auditCreated = await prisma.auditLog.findFirst({
      where: { event: "driver.created" },
      orderBy: { createdAt: "desc" },
    });
    expect(auditCreated).toBeTruthy();
  });

  it("lets only super admins list and inspect applications", async () => {
    const stamp = Date.now();
    const adminEmail = `iso-drv-admin-${stamp}@example.com`;
    const ownerEmail = `iso-drv-owner-${stamp}@example.com`;
    const driverEmail = `iso-drv-a-${stamp}@example.com`;

    await register(adminEmail);
    await register(ownerEmail);
    await promoteToSuperAdmin(adminEmail);

    const admin = await login(adminEmail, "Password123!", `iso-admin-${stamp}`);
    const ownerAuth = await login(ownerEmail, "Password123!", `iso-owner-${stamp}`);

    const created = await request(app.getHttpServer())
      .post(`${basePath}/drivers`)
      .send({
        email: driverEmail,
        firstName: "Tenant",
        lastName: "A",
        phone: `+316${stamp.toString().slice(-8)}`,
      })
      .expect(201);

    await request(app.getHttpServer())
      .get(`${basePath}/admin/drivers`)
      .set("Authorization", `Bearer ${ownerAuth.accessToken}`)
      .expect(403);

    const listed = await request(app.getHttpServer())
      .get(`${basePath}/admin/drivers`)
      .set("Authorization", `Bearer ${admin.accessToken}`)
      .expect(200);

    expect(
      (listed.body.data.data as Array<{ id: string }>).some(
        (row) => row.id === created.body.data.id,
      ),
    ).toBe(true);

    const got = await request(app.getHttpServer())
      .get(`${basePath}/admin/drivers/${created.body.data.id}`)
      .set("Authorization", `Bearer ${admin.accessToken}`)
      .expect(200);

    expect(got.body.data.applicationNumber).toBe(created.body.data.applicationNumber);
  });

  it("supports application review, approval, and rejection", async () => {
    const stamp = Date.now();
    const adminEmail = `life-drv-admin-${stamp}@example.com`;

    await register(adminEmail);
    await promoteToSuperAdmin(adminEmail);
    const admin = await login(adminEmail, "Password123!", `life-drv-admin-${stamp}`);

    const created = await request(app.getHttpServer())
      .post(`${basePath}/drivers`)
      .send({
        email: `life-drv-${stamp}@example.com`,
        firstName: "Life",
        lastName: "Cycle",
        phone: `+316${stamp.toString().slice(-8)}`,
      })
      .expect(201);

    const id = created.body.data.id as string;

    await request(app.getHttpServer())
      .post(`${basePath}/admin/drivers/${id}/approve`)
      .set("Authorization", `Bearer ${admin.accessToken}`)
      .expect(400);

    const underReview = await request(app.getHttpServer())
      .post(`${basePath}/admin/drivers/${id}/under-review`)
      .set("Authorization", `Bearer ${admin.accessToken}`)
      .expect(201);

    expect(underReview.body.data.approvalStatus).toBe(DriverApprovalStatus.UNDER_REVIEW);
    expect(underReview.body.data.onboardingStatus).toBe(DriverOnboardingStatus.UNDER_REVIEW);

    const approved = await request(app.getHttpServer())
      .post(`${basePath}/admin/drivers/${id}/approve`)
      .set("Authorization", `Bearer ${admin.accessToken}`)
      .expect(201);

    expect(approved.body.data.status).toBe(DriverStatus.ACTIVE);
    expect(approved.body.data.approvalStatus).toBe(DriverApprovalStatus.APPROVED);

    const other = await request(app.getHttpServer())
      .post(`${basePath}/drivers`)
      .send({
        email: `life-drv-rej-${stamp}@example.com`,
        firstName: "Reject",
        lastName: "Me",
        phone: `+316${(stamp + 1).toString().slice(-8)}`,
      })
      .expect(201);

    await request(app.getHttpServer())
      .post(`${basePath}/admin/drivers/${other.body.data.id}/under-review`)
      .set("Authorization", `Bearer ${admin.accessToken}`)
      .expect(201);

    const rejected = await request(app.getHttpServer())
      .post(`${basePath}/admin/drivers/${other.body.data.id}/reject`)
      .set("Authorization", `Bearer ${admin.accessToken}`)
      .send({ reason: "Incomplete documents" })
      .expect(201);

    expect(rejected.body.data.status).toBe(DriverStatus.REJECTED);
    expect(rejected.body.data.approvalStatus).toBe(DriverApprovalStatus.REJECTED);
  });

  it("saves onboarding details and documents after email verification", async () => {
    const stamp = Date.now();
    const adminEmail = `doc-drv-admin-${stamp}@example.com`;
    const driverEmail = `doc-drv-${stamp}@example.com`;

    await register(adminEmail);
    await promoteToSuperAdmin(adminEmail);
    const admin = await login(adminEmail, "Password123!", `doc-drv-admin-${stamp}`);

    const created = await request(app.getHttpServer())
      .post(`${basePath}/drivers`)
      .send({
        email: driverEmail,
        firstName: "Doc",
        lastName: "Driver",
        phone: `+316${stamp.toString().slice(-8)}`,
      })
      .expect(201);

    const id = created.body.data.id as string;

    await request(app.getHttpServer())
      .post(`${basePath}/drivers/${id}/details`)
      .send({
        address: "12A Damrak, 1012 LG Amsterdam",
        houseNo: "12A",
        streetName: "Damrak",
        postalCode: "1012 LG",
        city: "Amsterdam",
        province: "Noord-Holland",
        country: "Netherlands",
        countryCode: "NL",
        shift: DriverShift.FLEXIBLE,
        operatingCountry: "NL",
        operatingCity: "Amsterdam",
        languages: [{ code: "en", fluency: "FLUENT" }],
        dressesInSuit: true,
      })
      .expect(400);

    await prisma.user.update({
      where: { email: driverEmail },
      data: { isEmailVerified: true },
    });
    await prisma.driver.update({
      where: { id },
      data: { onboardingEmailVerified: true },
    });

    const details = await request(app.getHttpServer())
      .post(`${basePath}/drivers/${id}/details`)
      .send({
        address: "12A Damrak, 1012 LG Amsterdam",
        houseNo: "12A",
        streetName: "Damrak",
        postalCode: "1012 LG",
        city: "Amsterdam",
        province: "Noord-Holland",
        country: "Netherlands",
        countryCode: "NL",
        shift: DriverShift.FLEXIBLE,
        operatingCountry: "NL",
        operatingCity: "Amsterdam",
        languages: [
          { code: "en", fluency: "FLUENT" },
          { code: "nl", fluency: "CONVERSATIONAL" },
          { code: "tr", fluency: "NORMAL" },
          { code: "ur", fluency: "FLUENT" },
        ],
        dressesInSuit: true,
      })
      .expect(201);

    expect(details.body.data.operatingCity).toBe("Amsterdam");
    expect(details.body.data.homeAddress).toBe("12A Damrak, 1012 LG Amsterdam");
    expect(details.body.data.houseNo).toBe("12A");
    expect(details.body.data.streetName).toBe("Damrak");
    expect(details.body.data.postalCode).toBe("1012 LG");
    expect(details.body.data.city).toBe("Amsterdam");
    expect(details.body.data.province).toBe("Noord-Holland");
    expect(details.body.data.country).toBe("Netherlands");
    expect(details.body.data.countryCode).toBe("NL");
    expect(details.body.data.dressesInSuit).toBe(true);
    expect(details.body.data.languages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "en", fluency: "FLUENT" }),
        expect.objectContaining({ code: "nl", fluency: "CONVERSATIONAL" }),
        expect.objectContaining({ code: "tr", fluency: "NORMAL" }),
        expect.objectContaining({ code: "ur", fluency: "FLUENT" }),
      ]),
    );

    const sampleUrl = `https://cdn.example.com/drivers/${stamp}.jpg`;
    const documents = await request(app.getHttpServer())
      .post(`${basePath}/drivers/${id}/documents`)
      .send({
        chauffeurFront: sampleUrl,
        chauffeurBack: sampleUrl,
        licenseFront: sampleUrl,
        licenseBack: sampleUrl,
        nationalIdFront: sampleUrl,
        nationalIdBack: sampleUrl,
        kiwaPermit: sampleUrl,
        vehicleInsurance: sampleUrl,
        airportStaPass: sampleUrl,
        kvkNo: "12345678",
        licenseExpiry: "2028-12-31",
      })
      .expect(201);

    expect(documents.body.data.documents.length).toBeGreaterThan(0);
    expect(documents.body.data.kvkNo).toBe("12345678");
    expect(documents.body.data.licenseExpiry).toBe("2028-12-31T00:00:00.000Z");

    const listed = await request(app.getHttpServer())
      .get(`${basePath}/admin/drivers`)
      .query({ q: "Doc" })
      .set("Authorization", `Bearer ${admin.accessToken}`)
      .expect(200);

    expect(
      (listed.body.data.data as Array<{ firstName: string }>).some(
        (row) => row.firstName === "Doc",
      ),
    ).toBe(true);
  });

  it("re-sends OTP when driver re-registers with same email before verifying", async () => {
    const stamp = Date.now();
    const email = `rereg-drv-${stamp}@example.com`;

    // First registration — sends OTP, driver not yet email-verified
    const first = await request(app.getHttpServer())
      .post(`${basePath}/drivers`)
      .send({
        email,
        firstName: "ReReg",
        lastName: "Driver",
        phone: `+316${stamp.toString().slice(-8)}`,
      })
      .expect(201);

    expect(first.body.data.nextStep).toBe("verify-email");
    expect(authEmailServiceMock.sendVerificationEmail).toHaveBeenCalledWith(
      expect.objectContaining({ email }),
    );
    authEmailServiceMock.sendVerificationEmail.mockClear();

    // Second registration with same email — email still not verified
    const second = await request(app.getHttpServer())
      .post(`${basePath}/drivers`)
      .send({
        email,
        firstName: "ReReg",
        lastName: "Driver",
        phone: `+316${stamp.toString().slice(-8)}`,
      })
      .expect(201);

    // Must return the same driver id and nextStep = verify-email
    expect(second.body.data.id).toBe(first.body.data.id);
    expect(second.body.data.nextStep).toBe("verify-email");
    // Must have sent a new OTP
    expect(authEmailServiceMock.sendVerificationEmail).toHaveBeenCalledTimes(1);
    expect(authEmailServiceMock.sendVerificationEmail).toHaveBeenCalledWith(
      expect.objectContaining({ email }),
    );
  });

  it("rejects a second application only after onboarding documents are complete", async () => {
    const stamp = Date.now();
    const email = `plate-drv-${stamp}@example.com`;

    await request(app.getHttpServer())
      .post(`${basePath}/drivers`)
      .send({
        email,
        firstName: "Plate",
        lastName: "One",
        phone: `+316${stamp.toString().slice(-8)}`,
      })
      .expect(201);

    await prisma.driver.updateMany({
      where: { email },
      data: {
        onboardingEmailVerified: true,
        onboardingDetails: true,
        onboardingVehicle: true,
        onboardingDocuments: true,
      },
    });
    await prisma.user.update({
      where: { email },
      data: { isEmailVerified: true },
    });

    await request(app.getHttpServer())
      .post(`${basePath}/drivers`)
      .send({
        email,
        firstName: "Plate",
        lastName: "Two",
        phone: `+316${(stamp + 1).toString().slice(-8)}`,
      })
      .expect(409);
  });

  it("resumes incomplete registration at the step where the driver left off", async () => {
    const stamp = Date.now();
    const email = `resume-drv-${stamp}@example.com`;

    const created = await request(app.getHttpServer())
      .post(`${basePath}/drivers`)
      .send({
        email,
        firstName: "Resume",
        lastName: "Driver",
        phone: `+316${stamp.toString().slice(-8)}`,
      })
      .expect(201);

    expect(created.body.data.nextStep).toBe("verify-email");

    await prisma.driver.update({
      where: { id: created.body.data.id as string },
      data: {
        onboardingEmailVerified: true,
        onboardingDetails: true,
      },
    });
    await prisma.user.update({
      where: { email },
      data: { isEmailVerified: true },
    });

    const resumed = await request(app.getHttpServer())
      .post(`${basePath}/drivers`)
      .send({
        email,
        firstName: "Resume",
        lastName: "Driver",
        phone: `+316${stamp.toString().slice(-8)}`,
      })
      .expect(201);

    expect(resumed.body.data.id).toBe(created.body.data.id);
    expect(resumed.body.data.message).toBe(
      "Welcome back. Continue your registration from where you left off.",
    );
    expect(resumed.body.data.nextStep).toBe("vehicle");
    expect(resumed.body.data.progress).toEqual({
      personal: true,
      emailVerified: true,
      details: true,
      vehicle: false,
      documents: false,
    });
  });

  it("resends onboarding OTP when user email is verified but driver onboarding is not", async () => {
    const stamp = Date.now();
    const driverEmail = `resend-drv-${stamp}@example.com`;

    await request(app.getHttpServer())
      .post(`${basePath}/drivers`)
      .send({
        email: driverEmail,
        firstName: "Resend",
        lastName: "Driver",
        phone: `+316${stamp.toString().slice(-8)}`,
      })
      .expect(201);

    authEmailServiceMock.sendVerificationEmail.mockClear();

    await prisma.user.update({
      where: { email: driverEmail },
      data: { isEmailVerified: true },
    });

    const response = await request(app.getHttpServer())
      .post(`${basePath}/drivers/resend-otp`)
      .send({ email: driverEmail })
      .expect(201);

    expect(response.body.data.message).toBe("Verification code sent to email");
    expect(authEmailServiceMock.sendVerificationEmail).toHaveBeenCalledTimes(1);
    expect(authEmailServiceMock.sendVerificationEmail).toHaveBeenCalledWith(
      expect.objectContaining({ email: driverEmail }),
    );
  });

  it("marks driver onboarding email verified after verify-email", async () => {
    const stamp = Date.now();
    const driverEmail = `verify-drv-${stamp}@example.com`;
    const { createHash } = await import("crypto");
    const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

    const created = await request(app.getHttpServer())
      .post(`${basePath}/drivers`)
      .send({
        email: driverEmail,
        firstName: "Verify",
        lastName: "Driver",
        phone: `+316${stamp.toString().slice(-8)}`,
      })
      .expect(201);

    const user = await prisma.user.findUniqueOrThrow({ where: { email: driverEmail } });
    const otp = "424242";
    await prisma.emailVerificationToken.updateMany({
      where: { userId: user.id, consumedAt: null },
      data: { consumedAt: new Date() },
    });
    await prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(otp),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    const verified = await request(app.getHttpServer())
      .post(`${basePath}/drivers/verify-email`)
      .send({ email: driverEmail, token: otp })
      .expect(201);

    expect(verified.body.data.message).toBe("Email verified");
    expect(verified.body.data.progress.emailVerified).toBe(true);

    const userAfter = await prisma.user.findUniqueOrThrow({ where: { email: driverEmail } });
    const driverAfter = await prisma.driver.findUniqueOrThrow({
      where: { id: created.body.data.id as string },
    });
    expect(userAfter.isEmailVerified).toBe(true);
    expect(driverAfter.onboardingEmailVerified).toBe(true);

    const status = await request(app.getHttpServer())
      .post(`${basePath}/drivers/status`)
      .send({ email: driverEmail })
      .expect(201);
    expect(status.body.data.progress.emailVerified).toBe(true);
  });
});
