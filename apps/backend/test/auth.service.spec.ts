import { ForbiddenException, UnauthorizedException } from "@nestjs/common";
import { type JwtService } from "@nestjs/jwt";
import { type ConfigService } from "@nestjs/config";
import * as argon2 from "argon2";
import { RoleKey } from "@prisma/client";
import { AuthService } from "../src/modules/auth/auth.service";
import { type AuthEmailService } from "../src/modules/auth/services/auth-email.service";

describe("AuthService (unit)", () => {
  const userId = "user-1";
  const sessionId = "session-1";
  const email = "user@example.com";

  const usersService = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    markEmailVerified: jest.fn(),
    updatePassword: jest.fn(),
    updateLoginFailure: jest.fn(),
  };

  const customers = {
    create: jest.fn(),
  };

  const rolesService = {
    ensureDefaults: jest.fn(),
    assignRoles: jest.fn(),
    getRoleKeysByUserId: jest.fn(),
  };

  const sessionsService = {
    create: jest.fn(),
    getById: jest.fn(),
    rotateRefreshToken: jest.fn(() => true),
    revokeCurrent: jest.fn(),
    revokeAll: jest.fn(),
  };

  const jwtService = {
    sign: jest.fn(),
  };

  const configService = {
    getOrThrow: jest.fn((key: string) => {
      const values: Record<string, string | number> = {
        JWT_ACCESS_TTL_SECONDS: 43200,
        JWT_REFRESH_TTL_SECONDS: 86400,
        JWT_REMEMBER_ME_TTL_SECONDS: 7_776_000,
        JWT_ACCESS_SECRET: "access",
        JWT_REFRESH_SECRET: "refresh",
        AUTH_LOGIN_MAX_ATTEMPTS: 3,
        AUTH_LOCKOUT_MINUTES: 1,
      };
      return values[key];
    }),
  };

  const authEmails = {
    sendVerificationEmail: jest.fn(),
    sendPasswordResetEmail: jest.fn(),
  };

  const prisma = {
    passwordResetToken: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    emailVerificationToken: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
  };

  let service: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();
    jwtService.sign.mockReturnValueOnce("access-token").mockReturnValueOnce("refresh-token");
    sessionsService.create.mockResolvedValue({ id: sessionId });
    customers.create.mockResolvedValue({ id: "customer-1", type: "NORMAL" });
    service = new AuthService(
      usersService as never,
      customers as never,
      rolesService as never,
      sessionsService as never,
      jwtService as unknown as JwtService,
      configService as unknown as ConfigService,
      authEmails as unknown as AuthEmailService,
      prisma as never,
    );
    await service.onModuleInit();
  });

  it("issues a csrf token", () => {
    const first = service.issueCsrf();
    const second = service.issueCsrf();

    expect(first.csrfToken).toMatch(/^[0-9a-f]{64}$/);
    expect(second.csrfToken).toMatch(/^[0-9a-f]{64}$/);
    expect(second.csrfToken).not.toBe(first.csrfToken);
  });

  it("registers a user and queues verification email", async () => {
    usersService.findByEmail.mockResolvedValue(null);
    usersService.create.mockResolvedValue({ id: userId, email });

    await service.register({ email, password: "Password123!" }, { headers: {}, ip: "127.0.0.1" });

    expect(rolesService.assignRoles).toHaveBeenCalledWith({
      userId,
      keys: [RoleKey.CUSTOMER],
    });
    expect(customers.create).toHaveBeenCalledWith({ userId });
    expect(authEmails.sendVerificationEmail).toHaveBeenCalledWith({
      userId,
      email,
      phone: undefined,
      channel: "email",
    });
  });

  it("locks account after repeated failures", async () => {
    const passwordHash = await argon2.hash("correct");
    usersService.findByEmail.mockResolvedValue({
      id: userId,
      email,
      isActive: true,
      isEmailVerified: true,
      passwordHash,
      failedLoginCount: 2,
      lockoutUntil: null,
    });

    await expect(
      service.login({ email, password: "wrong" }, { headers: {}, ip: "127.0.0.1" }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(usersService.updateLoginFailure).toHaveBeenCalledWith({
      userId,
      failedLoginCount: 3,
      lockoutUntil: expect.any(Date),
    });
  });

  it("rejects login when account is locked", async () => {
    usersService.findByEmail.mockResolvedValue({
      id: userId,
      email,
      isActive: true,
      isEmailVerified: true,
      passwordHash: await argon2.hash("correct"),
      failedLoginCount: 3,
      lockoutUntil: new Date(Date.now() + 60_000),
    });

    await expect(
      service.login({ email, password: "correct" }, { headers: {}, ip: "127.0.0.1" }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("requires a verified email address before login", async () => {
    usersService.findByEmail.mockResolvedValue({
      id: userId,
      email,
      isActive: true,
      isEmailVerified: false,
      passwordHash: await argon2.hash("correct"),
      failedLoginCount: 0,
      lockoutUntil: null,
    });

    await expect(
      service.login({ email, password: "correct" }, { headers: {}, ip: "127.0.0.1" }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("rotates refresh token on the same session", async () => {
    const refreshToken = "current-refresh";
    const refreshTokenHash = await argon2.hash(refreshToken);
    sessionsService.getById.mockResolvedValue({
      id: sessionId,
      userId,
      revokedAt: null,
      refreshTokenHash,
      expiresAt: new Date(Date.now() + 60_000),
      deviceId: "device-1",
    });
    usersService.findById.mockResolvedValue({
      id: userId,
      email,
      isActive: true,
      isEmailVerified: true,
    });

    const result = await service.refresh(
      {},
      {
        headers: {},
        ip: "127.0.0.1",
        user: {
          sub: userId,
          sid: sessionId,
          email,
          refreshToken,
        },
      },
    );

    expect(result.sessionId).toBe(sessionId);
    expect(sessionsService.create).not.toHaveBeenCalled();
    expect(sessionsService.rotateRefreshToken).toHaveBeenCalledWith({
      sessionId,
      currentTokenHash: refreshTokenHash,
      tokenHash: expect.any(String),
      expiresAt: expect.any(Date),
    });
  });

  it("revokes session on refresh replay/invalid token", async () => {
    sessionsService.getById.mockResolvedValue({
      id: sessionId,
      userId,
      revokedAt: null,
      refreshTokenHash: await argon2.hash("other-token"),
      expiresAt: new Date(Date.now() + 60_000),
    });
    usersService.findById.mockResolvedValue({
      id: userId,
      email,
      isActive: true,
      isEmailVerified: true,
    });

    await expect(
      service.refresh(
        {},
        {
          headers: {},
          ip: "127.0.0.1",
          user: {
            sub: userId,
            sid: sessionId,
            email,
            refreshToken: "replayed-token",
          },
        },
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(sessionsService.revokeCurrent).toHaveBeenCalledWith({ sessionId });
  });
});
