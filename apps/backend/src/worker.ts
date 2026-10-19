import "./bootstrap/load-env";
import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { AppLogger } from "./common/logger/app.logger";
import { APP_NAME } from "./config/api.constants";
import { getQueueMode, QueueMode } from "./infrastructure/queue/queue.config";
import { WorkerModule } from "./worker.module";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.createApplicationContext(WorkerModule, {
    bufferLogs: true,
  });

  const logger = app.get(AppLogger);
  app.useLogger(logger);

  const configService = app.get(ConfigService);
  const mode = getQueueMode(configService);

  if (mode === QueueMode.Api) {
    await app.close();
    throw new Error(
      "QUEUE_MODE=api cannot run the worker process; set QUEUE_MODE=worker (or all for local)",
    );
  }

  logger.log(`${APP_NAME} worker started (QUEUE_MODE=${mode})`, "Bootstrap");

  const shutdown = async (signal: string) => {
    logger.log(`Worker shutting down (${signal})`, "Bootstrap");
    await app.close();
    process.exit(0);
  };

  process.on("SIGINT", () => {
    void shutdown("SIGINT");
  });
  process.on("SIGTERM", () => {
    void shutdown("SIGTERM");
  });
}

void bootstrap();
