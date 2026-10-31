import { Controller, Get, Inject, Query, UseGuards } from "@nestjs/common";
import { RoleKey } from "@prisma/client";
import { Roles } from "../../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { AnalyticsQueryDto, OverviewQueryDto } from "../dto/dashboard.dto";
import { DashboardService } from "../services/dashboard.service";

@Controller("admin/dashboard")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleKey.SUPER_ADMIN)
export class DashboardController {
  constructor(@Inject(DashboardService) private readonly dashboard: DashboardService) {}

  @Get()
  platform(@Query() query: AnalyticsQueryDto) {
    return this.dashboard.platform(query);
  }

  @Get("overview")
  overview(@Query() query: OverviewQueryDto) {
    return this.dashboard.overview(query);
  }

  @Get("bookings")
  bookings(@Query() query: AnalyticsQueryDto) {
    return this.dashboard.bookings(query);
  }

  @Get("users")
  users(@Query() query: AnalyticsQueryDto) {
    return this.dashboard.users(query);
  }

  @Get("drivers")
  drivers(@Query() query: AnalyticsQueryDto) {
    return this.dashboard.drivers(query);
  }
}
