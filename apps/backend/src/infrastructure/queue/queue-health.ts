import type { ConfigService } from "@nestjs/config";
import { Queue } from "bullmq";
import { createBullMqConnection, getRedisConfig } from "../redis/redis.config";

export async function probeBullMqHealth(configService: ConfigService) {
  const redis = getRedisConfig(configService);
  const connection = createBullMqConnection(redis);
  const queue = new Queue("health", {
    connection,
    prefix: redis.bullmqPrefix,
  });

  try {
    await queue.getJobCounts();
    return true;
  } finally {
    await queue.close();
  }
}
