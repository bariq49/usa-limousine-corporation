import { createBullMqConnection, getRedisConfig } from "../src/infrastructure/redis/redis.config";

describe("redis.config", () => {
  function configService(values: Record<string, string | undefined>) {
    return {
      getOrThrow: (key: string) => {
        const value = values[key];
        if (value === undefined) {
          throw new Error(`missing ${key}`);
        }
        return value;
      },
      get: (key: string) => values[key],
    } as never;
  }

  it("parses redis:// with auth, db, and prefixes", () => {
    const config = getRedisConfig(
      configService({
        REDIS_URL: "redis://user:p%40ss@localhost:6380/2",
        REDIS_KEY_PREFIX: "ams",
      }),
    );

    expect(config).toMatchObject({
      host: "localhost",
      port: 6380,
      username: "user",
      password: "p@ss",
      db: 2,
      tls: false,
      tlsRejectUnauthorized: true,
      keyPrefix: "ams:",
      bullmqPrefix: "ams:bull",
    });
  });

  it("enables tls for rediss://", () => {
    const config = getRedisConfig(
      configService({
        REDIS_URL: "rediss://localhost:6379",
      }),
    );

    expect(config.tls).toBe(true);
    expect(
      (createBullMqConnection(config) as { tls?: { rejectUnauthorized: boolean } }).tls,
    ).toEqual({
      rejectUnauthorized: true,
    });
  });

  it("parses sentinel topology", () => {
    const config = getRedisConfig(
      configService({
        REDIS_URL: "redis://:secret@localhost:6379/0",
        REDIS_SENTINELS: "10.0.0.1:26379,10.0.0.2:26379",
        REDIS_SENTINEL_NAME: "mymaster",
      }),
    );

    expect(config.sentinelName).toBe("mymaster");
    expect(config.sentinels).toEqual([
      { host: "10.0.0.1", port: 26379 },
      { host: "10.0.0.2", port: 26379 },
    ]);

    const connection = createBullMqConnection(config) as {
      sentinels?: { host: string; port: number }[];
      name?: string;
    };
    expect(connection.sentinels).toEqual(config.sentinels);
    expect(connection.name).toBe("mymaster");
  });
});
