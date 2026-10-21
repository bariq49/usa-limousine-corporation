import { type INestApplication } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { configureApp } from "../src/bootstrap/configure-app";
import { API_PREFIX, API_VERSION } from "../src/config/api.constants";

const dependencyStatuses = ["up", "down", "not_configured"] as const;

describe("HealthController (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication({
      bufferLogs: true,
    });
    configureApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it(`GET /${API_PREFIX}/v${API_VERSION}/health`, async () => {
    const response = await request(app.getHttpServer()).get(
      `/${API_PREFIX}/v${API_VERSION}/health`,
    );

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.database).toBe("up");
    expect(["ok", "degraded"]).toContain(response.body.data.status);
    expect(dependencyStatuses).toContain(response.body.data.redis);
    expect(dependencyStatuses).toContain(response.body.data.queue);
    expect(dependencyStatuses).toContain(response.body.data.storage);
    expect(dependencyStatuses).toContain(response.body.data.email);
    expect(dependencyStatuses).toContain(response.body.data.websocket);
    expect(dependencyStatuses).toContain(response.body.data.firebase);
    expect(dependencyStatuses).toContain(response.body.data.twilio);
    expect(response.body.meta.path).toBe(`/${API_PREFIX}/v${API_VERSION}/health`);
    expect(typeof response.body.meta.timestamp).toBe("string");
  });
});
