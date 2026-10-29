import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { RoleKey } from "@prisma/client";
import { Roles } from "../../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { BulkDeleteDto } from "../dto/bulk-delete.dto";
import { CreateDto, QueryDto, UpdateDto } from "../dto/hourly-pricing.dto";
import { HourlyPricingService } from "../services/hourly-pricing.service";

@Controller("admin/vehicle-category-hourly-pricing")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleKey.SUPER_ADMIN)
export class HourlyPricingController {
  constructor(
    @Inject(HourlyPricingService)
    private readonly hourlyPricingService: HourlyPricingService,
  ) {}

  @Get()
  findAll(@Query() query: QueryDto) {
    return this.hourlyPricingService.findAll(query);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.hourlyPricingService.findById(id);
  }

  @Post()
  create(@Body() body: CreateDto) {
    return this.hourlyPricingService.create(body);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() body: UpdateDto) {
    return this.hourlyPricingService.update(id, body);
  }

  @Delete("bulk")
  bulkRemove(@Body() body: BulkDeleteDto) {
    return this.hourlyPricingService.bulkRemove(body);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.hourlyPricingService.remove(id);
  }
}
