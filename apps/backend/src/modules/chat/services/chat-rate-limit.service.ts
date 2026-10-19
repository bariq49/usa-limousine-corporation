import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { RedisService } from "../../../infrastructure/redis/redis.service";
import { CHAT_RATE, CHAT_REDIS } from "../constants/chat.constants";
import type { ChatRateConsume } from "../types/chat";

@Injectable()
export class ChatRateLimitService {
  constructor(@Inject(RedisService) private readonly redis: RedisService) {}

  async consume(props: ChatRateConsume): Promise<void> {
    if (!this.redis.isConfigured()) {
      return;
    }

    const window = props.windowSeconds ?? CHAT_RATE.windowSeconds;
    const redisKey = CHAT_REDIS.rate(props.bucket, props.key);
    const client = this.redis.getClient();
    const count = await client.incr(redisKey);
    if (count === 1) {
      await client.expire(redisKey, window);
    }
    if (count > props.limit) {
      const ttl = await client.ttl(redisKey);
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: `Rate limit exceeded for chat ${props.bucket}`,
          retryAfterSeconds: ttl > 0 ? ttl : window,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  send(userId: string) {
    return this.consume({
      bucket: "send",
      key: userId,
      limit: CHAT_RATE.sendPerUser,
    });
  }

  typing(userId: string) {
    return this.consume({
      bucket: "typing",
      key: userId,
      limit: CHAT_RATE.typingPerUser,
    });
  }
}
