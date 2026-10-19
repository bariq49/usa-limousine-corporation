import { BadRequestException, ServiceUnavailableException } from "@nestjs/common";
import type { ConfigService } from "@nestjs/config";
import { AgoraService } from "../src/infrastructure/agora/agora.service";

describe("AgoraService", () => {
  function build(env: Record<string, string | number | undefined> = {}) {
    const config = {
      get: (key: string) => env[key],
    } as unknown as ConfigService;
    return new AgoraService(config);
  }

  it("is not configured without credentials", () => {
    const service = build();
    expect(service.isConfigured()).toBe(false);
    expect(service.healthCheck()).toBe(false);
    expect(() => service.getAppId()).toThrow(ServiceUnavailableException);
    expect(() => service.buildRtcToken({ channel: "trip:1", uid: 1 })).toThrow(
      ServiceUnavailableException,
    );
  });

  it("builds an RTC token when configured", () => {
    const service = build({
      AGORA_APP_ID: "a".repeat(32),
      AGORA_APP_CERTIFICATE: "b".repeat(32),
      AGORA_TOKEN_TTL_SECONDS: 600,
    });
    expect(service.isConfigured()).toBe(true);
    expect(service.healthCheck()).toBe(true);
    expect(service.getAppId()).toBe("a".repeat(32));

    const result = service.buildRtcToken({ channel: "trip:abc", uid: 42 });
    expect(result.appId).toBe("a".repeat(32));
    expect(result.channel).toBe("trip:abc");
    expect(result.uid).toBe(42);
    expect(result.role).toBe("publisher");
    expect(typeof result.token).toBe("string");
    expect(result.token.length).toBeGreaterThan(20);
    expect(result.expiresAt.getTime()).toBeGreaterThan(Date.now());
  });

  it("rejects invalid channel and uid", () => {
    const service = build({
      AGORA_APP_ID: "a".repeat(32),
      AGORA_APP_CERTIFICATE: "b".repeat(32),
    });
    expect(() => service.buildRtcToken({ channel: "  ", uid: 1 })).toThrow(BadRequestException);
    expect(() => service.buildRtcToken({ channel: "trip:1", uid: -1 })).toThrow(
      BadRequestException,
    );
  });
});
