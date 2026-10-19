import "./bootstrap/load-env";
import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { AppModule } from "./app.module";
import { configureApp } from "./bootstrap/configure-app";
import { AppLogger } from "./common/logger/app.logger";
import { API_PREFIX, API_VERSION, APP_NAME, SWAGGER_PATH } from "./config/api.constants";
import { getQueueMode, QueueMode } from "./infrastructure/queue/queue.config";
import { mountQueueBoard } from "./infrastructure/queue/queue-board";
import { getWebSocketConfig } from "./infrastructure/websocket/websocket.config";
import { ConfigurableSocketIoAdapter } from "./infrastructure/websocket/websocket.adapter";
import { SocketIoAdapterLifecycle } from "./infrastructure/websocket/socket-io-adapter.lifecycle";
import { RedisService } from "./infrastructure/redis/redis.service";
import { HealthService } from "./modules/health/health.service";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    rawBody: true,
  });

  const env = configureApp(app);
  const logger = app.get(AppLogger);
  const configService = app.get(ConfigService);
  const queueMode = getQueueMode(configService);

  if (queueMode === QueueMode.Worker) {
    await app.close();
    throw new Error(
      "QUEUE_MODE=worker cannot run the HTTP API; use pnpm --filter @usa-limousine-corporation/backend start:worker",
    );
  }

  const websocketConfig = getWebSocketConfig(configService);
  const socketAdapter = new ConfigurableSocketIoAdapter(
    app,
    websocketConfig,
    app.get(RedisService),
  );
  await socketAdapter.connect();
  app.useWebSocketAdapter(socketAdapter);
  app.get(SocketIoAdapterLifecycle).register(socketAdapter);

  await app.listen(env.PORT);

  const boardPath = mountQueueBoard(app);
  const health = await app.get(HealthService).getHealth();

  logger.log(`${APP_NAME} listening on port ${env.PORT} [${env.NODE_ENV}]`, "Bootstrap");
  logger.log(`Queue mode: ${queueMode}`, "Bootstrap");
  if (boardPath) {
    logger.log(`Queue board: http://localhost:${env.PORT}${boardPath}`, "Bootstrap");
  }
  logger.log(`Database: ${health.database}`, "Bootstrap");
  logger.log(`Redis: ${health.redis}`, "Bootstrap");
  logger.log(`Queue: ${health.queue}`, "Bootstrap");
  logger.log(`Storage: ${health.storage}`, "Bootstrap");
  logger.log(`Email: ${health.email}`, "Bootstrap");
  logger.log(`WebSocket: ${health.websocket}`, "Bootstrap");
  logger.log(`Firebase: ${health.firebase}`, "Bootstrap");
  logger.log(
    `Health: http://localhost:${env.PORT}/${API_PREFIX}/v${API_VERSION}/health`,
    "Bootstrap",
  );
  if (env.SWAGGER_ENABLED) {
    logger.log(`Docs: http://localhost:${env.PORT}/${API_PREFIX}/${SWAGGER_PATH}`, "Bootstrap");
  }
}

void bootstrap();
