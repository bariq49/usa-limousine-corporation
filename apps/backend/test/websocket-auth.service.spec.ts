import { type JwtService } from "@nestjs/jwt";
import { type ConfigService } from "@nestjs/config";
import type { Socket } from "socket.io";
import { WebsocketAuthService } from "../src/infrastructure/websocket/websocket-auth.service";

describe("WebsocketAuthService", () => {
  const jwtService = {
    verify: jest.fn(),
  };
  const configService = {
    getOrThrow: jest.fn(() => "access-secret"),
  };
  const sessionsService = {
    getById: jest.fn(),
  };
  const usersService = {
    findById: jest.fn(),
  };

  const auth = new WebsocketAuthService(
    jwtService as unknown as JwtService,
    configService as unknown as ConfigService,
    sessionsService as never,
    usersService as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("rejects missing tokens", async () => {
    const client = {
      handshake: { auth: {}, headers: {} },
      data: {},
    } as unknown as Socket;

    await expect(auth.authenticate(client)).resolves.toBeNull();
  });

  it("accepts a bearer header token and stores identity for any user", async () => {
    jwtService.verify.mockReturnValue({
      sub: "u1",
      sid: "s1",
      email: "a@b.com",
      exp: 2_000_000_000,
    });
    sessionsService.getById.mockResolvedValue({
      id: "s1",
      userId: "u1",
      revokedAt: null,
      expiresAt: new Date(Date.now() + 60_000),
    });
    usersService.findById.mockResolvedValue({ id: "u1", isActive: true, isEmailVerified: true });
    const client = {
      handshake: { auth: {}, headers: { authorization: "Bearer header-token" } },
      data: {} as Record<string, unknown>,
    } as unknown as Socket;

    const identity = await auth.authenticate(client);
    expect(identity).toEqual({
      userId: "u1",
      sessionId: "s1",
      expiresAt: 2_000_000_000,
    });
    expect(client.data.user).toEqual(identity);
  });

  it("rejects a token for a revoked session", async () => {
    jwtService.verify.mockReturnValue({ sub: "u1", sid: "s1", email: "a@b.com", exp: 2e9 });
    sessionsService.getById.mockResolvedValue({
      id: "s1",
      userId: "u1",
      revokedAt: new Date(),
      expiresAt: new Date(Date.now() + 60_000),
    });
    usersService.findById.mockResolvedValue({ id: "u1", isActive: true, isEmailVerified: true });
    const client = {
      handshake: { auth: { token: "revoked" }, headers: {} },
      data: {},
    } as unknown as Socket;

    await expect(auth.authenticate(client)).resolves.toBeNull();
  });

  it("rejects expired or invalid tokens", async () => {
    jwtService.verify.mockImplementation(() => {
      throw new Error("jwt expired");
    });
    const client = {
      handshake: { auth: { token: "expired" }, headers: {} },
      data: {},
    } as unknown as Socket;

    await expect(auth.authenticate(client)).resolves.toBeNull();
  });
});
