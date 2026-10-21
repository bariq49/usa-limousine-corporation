import { createHash } from "crypto";
import { type INestApplication } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test, type TestingModule } from "@nestjs/testing";
import request from "supertest";
import { io, type Socket } from "socket.io-client";
import { AppModule } from "../src/app.module";
import { configureApp } from "../src/bootstrap/configure-app";
import { API_PREFIX, API_VERSION } from "../src/config/api.constants";
import { getAppEnv } from "../src/config/env";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../src/infrastructure/database/prisma.service";
import { WebsocketService } from "../src/infrastructure/websocket/websocket.service";
import { cleanupBookingTables } from "./helpers/booking-fixtures";
import { AuthEmailService } from "../src/modules/auth/services/auth-email.service";
import { AuthEmailQueueService } from "../src/modules/auth/jobs/auth-email-queue.service";
import { authEmailServiceMock, emailQueueLifecycleMock } from "./helpers/email-mocks";

const basePath = `/${API_PREFIX}/v${API_VERSION}`;

describe("Auth (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let configService: ConfigService;
  let cookieName: string;
  let serverPort: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(AuthEmailService)
      .useValue(authEmailServiceMock)
      .overrideProvider(AuthEmailQueueService)
      .useValue(emailQueueLifecycleMock)
      .compile();

    app = moduleFixture.createNestApplication({ bufferLogs: true });
    configureApp(app);
    await app.init();
    await app.listen(0);

    const address = app.getHttpServer().address();
    serverPort = typeof address === "object" && address ? address.port : 3001;

    prisma = app.get(PrismaService);
    jwtService = app.get(JwtService);
    configService = app.get(ConfigService);
    cookieName = getAppEnv(configService).authCookie.name;

    await cleanupBookingTables(prisma);
    await prisma.auditLog.deleteMany();
    await prisma.session.deleteMany();
    await prisma.emailVerificationToken.deleteMany();
    await prisma.passwordResetToken.deleteMany();
    await prisma.userRole.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await cleanupBookingTables(prisma);
    await prisma.auditLog.deleteMany();
    await prisma.session.deleteMany();
    await prisma.emailVerificationToken.deleteMany();
    await prisma.passwordResetToken.deleteMany();
    await prisma.userRole.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });

  function hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }

  function cookieHeader(setCookie?: string): string {
    if (!setCookie) {
      return "";
    }

    const match = setCookie.match(new RegExp(`${cookieName}=([^;]+)`));
    return match ? `${cookieName}=${match[1]}` : "";
  }

  function csrfCookieHeader(setCookie?: string): string {
    if (!setCookie) {
      return "";
    }

    const match = setCookie.match(/usa_limo_csrf_token=([^;]+)/);
    return match ? `usa_limo_csrf_token=${match[1]}` : "";
  }

  async function issueCsrf(): Promise<{ token: string; cookie: string }> {
    const response = await request(app.getHttpServer()).get(`${basePath}/auth/csrf`).expect(200);
    const setCookie = response.headers["set-cookie"] as string[] | undefined;
    const csrfSetCookie = setCookie?.find((value) => value.startsWith("usa_limo_csrf_token="));

    return {
      token: response.body.data.csrfToken as string,
      cookie: csrfCookieHeader(csrfSetCookie),
    };
  }

  async function register(
    email: string,
    password = "Password123!",
    verifyEmail = true,
  ): Promise<void> {
    await request(app.getHttpServer())
      .post(`${basePath}/auth/register`)
      .send({ email, password })
      .expect(201);

    if (verifyEmail) {
      await prisma.user.update({
        where: { email },
        data: { isEmailVerified: true },
      });
    }
  }

  async function login(
    email: string,
    password = "Password123!",
    deviceId = "device-1",
  ): Promise<{ accessToken: string; sessionId: string; refreshCookie?: string }> {
    const response = await request(app.getHttpServer())
      .post(`${basePath}/auth/login`)
      .set("x-device-id", deviceId)
      .send({ email, password })
      .expect(200);

    const setCookie = response.headers["set-cookie"] as string[] | undefined;
    const refreshCookie = setCookie?.find((value) => value.startsWith(`${cookieName}=`));

    const result: { accessToken: string; sessionId: string; refreshCookie?: string } = {
      accessToken: response.body.data.accessToken,
      sessionId: response.body.data.sessionId,
    };

    if (refreshCookie) {
      result.refreshCookie = refreshCookie;
    }

    return result;
  }

  it("registers and logs in with refresh cookie", async () => {
    const email = `login-${Date.now()}@example.com`;
    await register(email);
    const result = await login(email);

    expect(result.accessToken).toBeDefined();
    expect(result.sessionId).toBeDefined();
    expect(result.refreshCookie).toContain("HttpOnly");
    expect(result.refreshCookie).toContain("Path=/");
    expect(result.refreshCookie).toMatch(/SameSite=Lax/i);
    expect(result.refreshCookie).toMatch(/Max-Age=\d+/i);

    const loginResponse = await request(app.getHttpServer())
      .post(`${basePath}/auth/login`)
      .send({ email, password: "Password123!" })
      .expect(200);
    expect(loginResponse.body.data.accessToken).toBeDefined();
    expect(loginResponse.body.data.sessionId).toBeDefined();
    expect(loginResponse.body.data.refreshToken).toBeDefined();
    expect(loginResponse.body.success).toBe(true);
  });

  it("rejects invalid login credentials", async () => {
    const email = `fail-${Date.now()}@example.com`;
    await register(email);

    await request(app.getHttpServer())
      .post(`${basePath}/auth/login`)
      .send({ email, password: "WrongPassword1" })
      .expect(401);
  });

  it("requires email verification before login", async () => {
    const email = `unverified-${Date.now()}@example.com`;
    await register(email, "Password123!", false);

    await request(app.getHttpServer())
      .post(`${basePath}/auth/login`)
      .send({ email, password: "Password123!" })
      .expect(403);
  });

  it("locks the account after repeated failures", async () => {
    const email = `lock-${Date.now()}@example.com`;
    await register(email);
    const maxAttempts = configService.getOrThrow<number>("AUTH_LOGIN_MAX_ATTEMPTS");

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      await request(app.getHttpServer())
        .post(`${basePath}/auth/login`)
        .send({ email, password: "WrongPassword1" });
    }

    const locked = await request(app.getHttpServer())
      .post(`${basePath}/auth/login`)
      .send({ email, password: "Password123!" });

    expect([401, 403]).toContain(locked.status);
  });

  it("rotates refresh tokens on the same session and rejects replay", async () => {
    const email = `refresh-${Date.now()}@example.com`;
    await register(email);
    const first = await login(email);
    const csrf = await issueCsrf();

    const refresh = await request(app.getHttpServer())
      .post(`${basePath}/auth/refresh`)
      .set("Cookie", `${cookieHeader(first.refreshCookie)}; ${csrf.cookie}`)
      .set("x-csrf-token", csrf.token)
      .send({})
      .expect(200);

    expect(refresh.body.data.sessionId).toBe(first.sessionId);
    expect(refresh.body.data.accessToken).toBeDefined();
    expect(refresh.body.data.refreshToken).toBeDefined();

    const replay = await request(app.getHttpServer())
      .post(`${basePath}/auth/refresh`)
      .set("Cookie", `${cookieHeader(first.refreshCookie)}; ${csrf.cookie}`)
      .set("x-csrf-token", csrf.token)
      .send({});

    expect(replay.status).toBe(401);
  });

  it("requires CSRF for cookie-authenticated refresh even when a Bearer header is also sent", async () => {
    const email = `csrf-${Date.now()}@example.com`;
    await register(email);
    const first = await login(email);
    const refreshCookie = cookieHeader(first.refreshCookie);
    const csrf = await issueCsrf();
    const otherCsrf = await issueCsrf();

    await request(app.getHttpServer())
      .post(`${basePath}/auth/refresh`)
      .set("Cookie", refreshCookie)
      .send({})
      .expect(403);

    await request(app.getHttpServer())
      .post(`${basePath}/auth/refresh`)
      .set("Cookie", refreshCookie)
      .set("x-csrf-token", csrf.token)
      .send({})
      .expect(403);

    await request(app.getHttpServer())
      .post(`${basePath}/auth/refresh`)
      .set("Cookie", `${refreshCookie}; ${csrf.cookie}`)
      .set("x-csrf-token", "invalid-csrf-token-value-invalid-csrf-token-value")
      .send({})
      .expect(403);

    await request(app.getHttpServer())
      .post(`${basePath}/auth/refresh`)
      .set("Cookie", `${refreshCookie}; ${otherCsrf.cookie}`)
      .set("x-csrf-token", csrf.token)
      .send({})
      .expect(403);

    await request(app.getHttpServer())
      .post(`${basePath}/auth/refresh`)
      .set("Cookie", refreshCookie)
      .set("Authorization", `Bearer ${refreshCookie.slice(`${cookieName}=`.length)}`)
      .set("x-csrf-token", "invalid-csrf-token-value-invalid-csrf-token-value")
      .send({})
      .expect(403);

    await request(app.getHttpServer())
      .post(`${basePath}/auth/refresh`)
      .set("Cookie", `${refreshCookie}; ${csrf.cookie}`)
      .set("x-csrf-token", csrf.token)
      .send({})
      .expect(200);
  });

  it("does not require CSRF on Bearer-only endpoints", async () => {
    const email = `bearer-${Date.now()}@example.com`;
    await register(email);
    const auth = await login(email);

    await request(app.getHttpServer())
      .post(`${basePath}/auth/logout`)
      .set("Authorization", `Bearer ${auth.accessToken}`)
      .expect(200);
  });

  it("allows Bearer-only refresh without a CSRF header", async () => {
    const email = `bearer-refresh-${Date.now()}@example.com`;
    await register(email);
    const auth = await login(email);
    const refreshToken = cookieHeader(auth.refreshCookie).slice(`${cookieName}=`.length);

    await request(app.getHttpServer())
      .post(`${basePath}/auth/refresh`)
      .set("Authorization", `Bearer ${refreshToken}`)
      .send({})
      .expect(200);
  });

  it("treats an empty refresh cookie as absent for Bearer refresh", async () => {
    const email = `empty-cookie-${Date.now()}@example.com`;
    await register(email);
    const auth = await login(email);
    const refreshToken = cookieHeader(auth.refreshCookie).slice(`${cookieName}=`.length);

    await request(app.getHttpServer())
      .post(`${basePath}/auth/refresh`)
      .set("Cookie", `${cookieName}=`)
      .set("Authorization", `Bearer ${refreshToken}`)
      .send({})
      .expect(200);
  });

  it("supports logout and logout-all session revocation", async () => {
    const email = `logout-${Date.now()}@example.com`;
    await register(email);
    const first = await login(email, "Password123!", "device-a");
    const second = await login(email, "Password123!", "device-b");

    // New login keeps a single active session and revokes prior ones.
    expect(
      (await prisma.session.findUniqueOrThrow({ where: { id: first.sessionId } })).revokedAt,
    ).not.toBeNull();

    await request(app.getHttpServer())
      .post(`${basePath}/auth/logout`)
      .set("Authorization", `Bearer ${first.accessToken}`)
      .expect(401);

    await request(app.getHttpServer())
      .post(`${basePath}/auth/logout`)
      .set("Authorization", `Bearer ${second.accessToken}`)
      .expect(200);

    expect(
      (await prisma.session.findUniqueOrThrow({ where: { id: second.sessionId } })).revokedAt,
    ).not.toBeNull();

    await request(app.getHttpServer())
      .post(`${basePath}/auth/change-password`)
      .set("Authorization", `Bearer ${second.accessToken}`)
      .send({ currentPassword: "Password123!", newPassword: "Password1234!" })
      .expect(401);

    const third = await login(email, "Password123!", "device-c");

    await request(app.getHttpServer())
      .post(`${basePath}/auth/logout-all`)
      .set("Authorization", `Bearer ${third.accessToken}`)
      .expect(200);

    const remaining = await prisma.session.count({
      where: {
        userId: (await prisma.user.findUniqueOrThrow({ where: { email } })).id,
        revokedAt: null,
      },
    });
    expect(remaining).toBe(0);

    await request(app.getHttpServer())
      .post(`${basePath}/auth/change-password`)
      .set("Authorization", `Bearer ${third.accessToken}`)
      .send({ currentPassword: "Password123!", newPassword: "Password1234!" })
      .expect(401);
  });

  it("verifies email, resets password, and changes password", async () => {
    const email = `flow-${Date.now()}@example.com`;
    await register(email);
    const user = await prisma.user.findUniqueOrThrow({ where: { email } });

    const rawVerify = "verify-token-value";
    await prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(rawVerify),
        expiresAt: new Date(Date.now() + 60_000),
      },
    });

    await request(app.getHttpServer())
      .post(`${basePath}/auth/verify-email`)
      .send({ email, token: rawVerify })
      .expect(201);

    const verified = await prisma.user.findUniqueOrThrow({ where: { email } });
    expect(verified.isEmailVerified).toBe(true);

    const rawResetOtp = "482913";
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(rawResetOtp),
        expiresAt: new Date(Date.now() + 60_000),
      },
    });

    const verifiedReset = await request(app.getHttpServer())
      .post(`${basePath}/auth/verify-reset-otp`)
      .send({ email, otp: rawResetOtp })
      .expect(201);

    expect(verifiedReset.body.data.resetToken).toBeTruthy();

    await request(app.getHttpServer())
      .post(`${basePath}/auth/reset-password`)
      .send({
        email,
        resetToken: verifiedReset.body.data.resetToken,
        newPassword: "NewPassword123!",
      })
      .expect(201);

    const loginAfterReset = await login(email, "NewPassword123!");
    await request(app.getHttpServer())
      .post(`${basePath}/auth/change-password`)
      .set("Authorization", `Bearer ${loginAfterReset.accessToken}`)
      .send({ currentPassword: "NewPassword123!", newPassword: "AnotherPass123!" })
      .expect(201);

    await request(app.getHttpServer())
      .post(`${basePath}/auth/login`)
      .send({ email, password: "AnotherPass123!" })
      .expect(200);
  });

  it("rejects expired and invalid access tokens", async () => {
    const expired = jwtService.sign(
      { sub: "x", email: "x@example.com", sid: "s" },
      {
        secret: configService.getOrThrow<string>("JWT_ACCESS_SECRET"),
        expiresIn: -10,
      },
    );

    await request(app.getHttpServer())
      .post(`${basePath}/auth/change-password`)
      .set("Authorization", `Bearer ${expired}`)
      .send({ currentPassword: "Password123!", newPassword: "Password1234!" })
      .expect(401);

    await request(app.getHttpServer())
      .post(`${basePath}/auth/change-password`)
      .set("Authorization", "Bearer not-a-token")
      .send({ currentPassword: "Password123!", newPassword: "Password1234!" })
      .expect(401);
  });

  it("authenticates websocket connections with JWT, auto-joins user room, and rejects anonymous clients", async () => {
    const email = `ws-${Date.now()}@example.com`;
    await register(email);
    const auth = await login(email);
    const user = await prisma.user.findUniqueOrThrow({ where: { email } });
    const websocketService = app.get(WebsocketService);

    await new Promise<void>((resolve, reject) => {
      const socket: Socket = io(`http://127.0.0.1:${serverPort}`, {
        auth: { token: auth.accessToken },
        transports: ["websocket"],
        forceNew: true,
      });

      const timeout = setTimeout(() => {
        socket.disconnect();
        reject(new Error("timed out waiting for room event"));
      }, 5000);

      socket.on("connect", () => {
        // Room joins complete in handleConnection after the client connect event.
        setTimeout(() => {
          websocketService.broadcastToRoom({
            room: `user:${user.id}`,
            event: "test.room.ping",
            payload: { ok: true },
          });
        }, 50);
      });

      socket.on("test.room.ping", (payload) => {
        clearTimeout(timeout);
        expect(payload).toEqual({ ok: true });
        socket.disconnect();
        resolve();
      });

      socket.on("connect_error", (error) => {
        clearTimeout(timeout);
        socket.disconnect();
        reject(error);
      });
    });

    await new Promise<void>((resolve, reject) => {
      const socket: Socket = io(`http://127.0.0.1:${serverPort}`, {
        transports: ["websocket"],
        forceNew: true,
      });

      socket.on("connect", () => {
        socket.disconnect();
        reject(new Error("anonymous websocket should be rejected"));
      });
      socket.on("disconnect", () => resolve());
      socket.on("connect_error", () => resolve());
      setTimeout(() => resolve(), 1000);
    });
  });

  it("writes forensic audit context for login", async () => {
    const email = `audit-${Date.now()}@example.com`;
    await register(email);
    await login(email);

    const user = await prisma.user.findUniqueOrThrow({ where: { email } });
    const loginAudit = await prisma.auditLog.findFirst({
      where: { userId: user.id, event: "auth.login" },
      orderBy: { createdAt: "desc" },
    });

    expect(loginAudit).toBeTruthy();
    expect(loginAudit?.metadata).toMatchObject({ result: "success" });
  });

  it("returns the current user on GET /auth/me without secrets", async () => {
    const email = `me-${Date.now()}@example.com`;
    await register(email);
    const auth = await login(email);

    const me = await request(app.getHttpServer())
      .get(`${basePath}/auth/me`)
      .set("Authorization", `Bearer ${auth.accessToken}`)
      .expect(200);

    expect(me.body.success).toBe(true);
    expect(me.body.data.email).toBe(email);
    expect(me.body.data.id).toBeDefined();
    expect(me.body.data.sessionId).toBe(auth.sessionId);
    expect(me.body.data.roles).toEqual(expect.arrayContaining(["CUSTOMER"]));
    expect(me.body.data.isEmailVerified).toBe(true);
    expect(me.body.data.isActive).toBe(true);
    expect(me.body.data.name).toBeNull();
    expect(me.body.data.avatar).toBeNull();
    expect(me.body.data.passwordHash).toBeUndefined();
    expect(me.body.data.refreshTokenHash).toBeUndefined();
    expect(me.body.data.memberships).toBeUndefined();
    expect(JSON.stringify(me.body)).not.toMatch(/passwordHash|refreshTokenHash/);
  });

  it("rejects GET /auth/me for invalid, expired, and revoked sessions", async () => {
    const email = `me-deny-${Date.now()}@example.com`;
    await register(email);
    const auth = await login(email);

    await request(app.getHttpServer()).get(`${basePath}/auth/me`).expect(401);

    await request(app.getHttpServer())
      .get(`${basePath}/auth/me`)
      .set("Authorization", "Bearer not-a-token")
      .expect(401);

    const expired = jwtService.sign(
      { sub: "x", email: "x@example.com", sid: "s" },
      {
        secret: configService.getOrThrow<string>("JWT_ACCESS_SECRET"),
        expiresIn: -10,
      },
    );
    await request(app.getHttpServer())
      .get(`${basePath}/auth/me`)
      .set("Authorization", `Bearer ${expired}`)
      .expect(401);

    await prisma.session.update({
      where: { id: auth.sessionId },
      data: { revokedAt: new Date(), refreshTokenHash: null },
    });
    await request(app.getHttpServer())
      .get(`${basePath}/auth/me`)
      .set("Authorization", `Bearer ${auth.accessToken}`)
      .expect(401);
  });

  it("rejects GET /auth/me for inactive users", async () => {
    const email = `inactive-${Date.now()}@example.com`;
    await register(email);
    const auth = await login(email);
    await prisma.user.update({ where: { email }, data: { isActive: false } });

    await request(app.getHttpServer())
      .get(`${basePath}/auth/me`)
      .set("Authorization", `Bearer ${auth.accessToken}`)
      .expect(401);
  });

  it("issues an httpOnly CSRF cookie that matches the JSON token and replaces prior tokens", async () => {
    const email = `csrf-issue-${Date.now()}@example.com`;
    await register(email);
    const auth = await login(email);
    const refreshCookie = cookieHeader(auth.refreshCookie);

    const first = await request(app.getHttpServer()).get(`${basePath}/auth/csrf`).expect(200);
    const firstSetCookie = (first.headers["set-cookie"] as string[] | undefined)?.find((value) =>
      value.startsWith("usa_limo_csrf_token="),
    );
    const firstToken = first.body.data.csrfToken as string;
    const firstCookie = csrfCookieHeader(firstSetCookie);

    expect(firstToken).toMatch(/^[0-9a-f]{64}$/);
    expect(firstSetCookie).toContain("HttpOnly");
    expect(firstSetCookie).toContain("Path=/");
    expect(firstSetCookie).toMatch(/SameSite=Lax/i);
    expect(firstSetCookie).not.toContain(`${cookieName}=`);
    expect(firstCookie).toBe(`usa_limo_csrf_token=${firstToken}`);

    const second = await request(app.getHttpServer()).get(`${basePath}/auth/csrf`).expect(200);
    const secondSetCookie = (second.headers["set-cookie"] as string[] | undefined)?.find((value) =>
      value.startsWith("usa_limo_csrf_token="),
    );
    const secondToken = second.body.data.csrfToken as string;
    const secondCookie = csrfCookieHeader(secondSetCookie);

    expect(secondToken).not.toBe(firstToken);
    expect(secondCookie).toBe(`usa_limo_csrf_token=${secondToken}`);

    await request(app.getHttpServer())
      .post(`${basePath}/auth/refresh`)
      .set("Cookie", `${refreshCookie}; ${secondCookie}`)
      .set("x-csrf-token", firstToken)
      .send({})
      .expect(403);

    await request(app.getHttpServer())
      .post(`${basePath}/auth/refresh`)
      .set("Cookie", `${refreshCookie}; ${secondCookie}`)
      .set("x-csrf-token", secondToken)
      .send({})
      .expect(200);
  });

  it("allows credentialed CORS for dashboard origins and rejects unknown origins", async () => {
    const allowed = await request(app.getHttpServer())
      .get(`${basePath}/auth/csrf`)
      .set("Origin", "http://localhost:3001")
      .expect(200);
    expect(allowed.headers["access-control-allow-origin"]).toBe("http://localhost:3001");
    expect(allowed.headers["access-control-allow-credentials"]).toBe("true");

    const rejected = await request(app.getHttpServer())
      .get(`${basePath}/auth/csrf`)
      .set("Origin", "https://evil.example")
      .expect(200);
    expect(rejected.headers["access-control-allow-origin"]).not.toBe("https://evil.example");
  });

  it("does not enumerate emails on resend-otp", async () => {
    const unknown = await request(app.getHttpServer())
      .post(`${basePath}/auth/resend-otp`)
      .send({ email: `missing-${Date.now()}@example.com` })
      .expect(201);
    expect(unknown.body.data.message).toBe("Verification code sent to email");
  });
});
