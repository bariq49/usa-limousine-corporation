import { Controller, Get, Inject, ServiceUnavailableException } from "@nestjs/common";
import {
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
} from "@nestjs/swagger";
import { HealthService } from "./health.service";
import type { HealthStatus } from "./health.types";

@ApiTags("health")
@Controller("health")
export class HealthController {
  constructor(@Inject(HealthService) private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: "Application and infrastructure health check" })
  @ApiOkResponse({ description: "Core dependencies are healthy" })
  @ApiServiceUnavailableResponse({ description: "Database is unavailable" })
  async check(): Promise<HealthStatus> {
    const health = await this.healthService.getHealth();
    if (health.database === "down") {
      throw new ServiceUnavailableException(health);
    }

    return health;
  }

  @Get("queues")
  @ApiOperation({ summary: "BullMQ job counts per queue" })
  @ApiOkResponse({ description: "Queue metrics" })
  queues() {
    return this.healthService.getQueueMetrics();
  }
}
