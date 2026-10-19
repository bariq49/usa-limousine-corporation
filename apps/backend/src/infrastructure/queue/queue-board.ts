import { timingSafeEqual } from "node:crypto";
import type { INestApplication } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express";
import type { NextFunction, Request, Response } from "express";
import { QueueRegistry } from "./queue-registry";

function credentialsMatch(provided: string, expected: string): boolean {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) {
    return false;
  }
  return timingSafeEqual(a, b);
}

function createBasicAuthMiddleware(username: string, password: string) {
  const expected = Buffer.from(`${username}:${password}`).toString("base64");

  return (request: Request, response: Response, next: NextFunction) => {
    const header = request.headers.authorization;
    if (typeof header === "string" && header.startsWith("Basic ")) {
      const provided = header.slice("Basic ".length).trim();
      if (credentialsMatch(provided, expected)) {
        next();
        return;
      }
    }

    response.setHeader("WWW-Authenticate", 'Basic realm="Queue Board"');
    response.status(401).send("Unauthorized");
  };
}

export function mountQueueBoard(app: INestApplication): string | null {
  const config = app.get(ConfigService);
  const enabledRaw = config.get<string>("QUEUE_BOARD_ENABLED");
  const enabled =
    typeof enabledRaw === "string" && ["true", "1"].includes(enabledRaw.trim().toLowerCase());

  if (!enabled) {
    return null;
  }

  const username = config.get<string>("QUEUE_BOARD_USERNAME")?.trim();
  const password = config.get<string>("QUEUE_BOARD_PASSWORD");
  if (!username || !password) {
    throw new Error("QUEUE_BOARD_ENABLED requires QUEUE_BOARD_USERNAME and QUEUE_BOARD_PASSWORD");
  }

  const basePath = (config.get<string>("QUEUE_BOARD_PATH")?.trim() || "/admin/queues").replace(
    /\/$/,
    "",
  );
  const registry = app.get(QueueRegistry);
  const queues = registry.getQueues();
  if (queues.length === 0) {
    return null;
  }

  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath(basePath);

  createBullBoard({
    queues: queues.map((queue) => new BullMQAdapter(queue)),
    serverAdapter,
  });

  const router = serverAdapter.getRouter();
  const auth = createBasicAuthMiddleware(username, password);
  app.use(basePath, auth, router);
  return basePath;
}
