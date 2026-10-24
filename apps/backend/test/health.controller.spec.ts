import { ServiceUnavailableException } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import { HealthController } from "../src/modules/health/health.controller";
import { HealthService } from "../src/modules/health/health.service";

describe("HealthController", () => {
  it("throws 503 when database is down", async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthService,
          useValue: {
            getHealth: async () => ({
              status: "degraded",
              database: "down",
              redis: "not_configured",
              queue: "not_configured",
              storage: "not_configured",
              email: "not_configured",
              websocket: "not_configured",
              firebase: "not_configured",
              twilio: "not_configured",
              agora: "not_configured",
            }),
          },
        },
      ],
    }).compile();

    const controller = module.get(HealthController);

    await expect(controller.check()).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
