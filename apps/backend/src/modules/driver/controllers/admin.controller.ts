import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { RoleKey } from "@prisma/client";
import type { Request } from "express";
import { Roles } from "../../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { ApplicationQueryDto, BulkDeleteApplicationsDto, RejectDto } from "../dto/application.dto";
import { DeleteQueryDto, RejectDeleteDto } from "../dto/profile.dto";
import { QueryDto } from "../dto/activity.dto";
import { DriverActivityService } from "../services/activity.service";
import { DriverApplicationService } from "../services/application.service";
import { DriverProfileService } from "../services/profile.service";

@Controller("admin/drivers")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleKey.SUPER_ADMIN)
export class DriverAdminController {
  constructor(
    @Inject(DriverApplicationService)
    private readonly applicationService: DriverApplicationService,
    @Inject(DriverProfileService)
    private readonly profileService: DriverProfileService,
    @Inject(DriverActivityService)
    private readonly activityService: DriverActivityService,
  ) {}

  @Get()
  list(@Query() query: ApplicationQueryDto) {
    return this.applicationService.list(query);
  }

  @Get("delete-requests")
  listDeleteRequests(@Query() query: DeleteQueryDto) {
    return this.profileService.listDeleteRequests(query);
  }

  @Post("delete-requests/:id/approve")
  approveDeleteRequest(@Param("id") id: string, @Req() request: Request) {
    return this.profileService.approveDeleteRequest(id, request);
  }

  @Post("delete-requests/:id/reject")
  rejectDeleteRequest(
    @Param("id") id: string,
    @Body() body: RejectDeleteDto,
    @Req() request: Request,
  ) {
    return this.profileService.rejectDeleteRequest(id, body, request);
  }

  @Get(":id")
  getOverview(@Param("id") id: string) {
    return this.applicationService.getOverview(id);
  }

  @Get(":id/delete-request")
  getDeleteRequest(@Param("id") id: string) {
    return this.profileService.getDeleteRequestByDriverId(id);
  }

  @Get(":id/activity")
  listActivity(@Param("id") id: string) {
    return this.profileService.listActivity(id);
  }

  @Get(":id/performance")
  getPerformance(@Param("id") id: string, @Query() query: QueryDto) {
    return this.activityService.getForDriver(id, query);
  }

  @Get(":id/reviews")
  getReviews(@Param("id") id: string) {
    return this.applicationService.getReviews(id);
  }

  @Get(":id/vehicle")
  getVehicle(@Param("id") id: string) {
    return this.applicationService.getVehicle(id);
  }

  @Delete("bulk")
  bulkRemove(@Body() body: BulkDeleteApplicationsDto, @Req() request: Request) {
    return this.applicationService.bulkRemove(body, request);
  }

  @Delete(":id")
  remove(@Param("id") id: string, @Req() request: Request) {
    return this.applicationService.remove(id, request);
  }

  @Post(":id/under-review")
  markUnderReview(@Param("id") id: string, @Req() request: Request) {
    return this.applicationService.markUnderReview(id, request);
  }

  @Post(":id/approve")
  approve(@Param("id") id: string, @Req() request: Request) {
    return this.applicationService.approve(id, request);
  }

  @Post(":id/reject")
  reject(@Param("id") id: string, @Body() body: RejectDto, @Req() request: Request) {
    return this.applicationService.reject(id, body.reason, request);
  }

  @Post(":id/suspend")
  suspend(@Param("id") id: string, @Req() request: Request) {
    return this.applicationService.suspend(id, request);
  }

  @Post(":id/unsuspend")
  unsuspend(@Param("id") id: string, @Req() request: Request) {
    return this.applicationService.unsuspend(id, request);
  }
}
