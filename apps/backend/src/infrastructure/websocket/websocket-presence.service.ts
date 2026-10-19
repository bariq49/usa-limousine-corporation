import { Inject, Injectable } from "@nestjs/common";
import { RedisService } from "../redis/redis.service";

const ACQUIRE_CONNECTION_SCRIPT = `
local key = KEYS[1]
local socketId = ARGV[1]
local maxConnections = tonumber(ARGV[2])
local ttlSeconds = tonumber(ARGV[3])
local count = redis.call('SCARD', key)
if count >= maxConnections then
  return 0
end
redis.call('SADD', key, socketId)
redis.call('EXPIRE', key, ttlSeconds)
return 1
`;

@Injectable()
export class WebsocketPresenceService {
  constructor(@Inject(RedisService) private readonly redis: RedisService) {}

  async allowHandshake(params: { ip: string; limitPerMinute: number }) {
    const { ip, limitPerMinute } = params;
    if (limitPerMinute <= 0) {
      return true;
    }

    const key = `ws:rate:${ip || "unknown"}`;
    const client = this.redis.getClient();
    const count = await client.incr(key);
    if (count === 1) {
      await client.expire(key, 60);
    }

    return count <= limitPerMinute;
  }

  async tryAcquireConnection(params: { userId: string; socketId: string; maxConnections: number }) {
    const { userId, socketId, maxConnections } = params;
    if (maxConnections <= 0) {
      return true;
    }

    const key = `ws:conn:${userId}`;
    const client = this.redis.getClient();
    const result = await client.eval(
      ACQUIRE_CONNECTION_SCRIPT,
      1,
      key,
      socketId,
      maxConnections,
      60 * 60 * 24,
    );
    return Number(result) === 1;
  }

  async releaseConnection(params: { userId: string; socketId: string }) {
    const { userId, socketId } = params;
    await this.redis.getClient().srem(`ws:conn:${userId}`, socketId);
  }
}
