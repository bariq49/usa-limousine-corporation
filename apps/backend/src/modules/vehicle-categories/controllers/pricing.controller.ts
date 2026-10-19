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
import { CreatePricingDto } from "../dto/create-pricing.dto";
import { PricingQueryDto } from "../dto/pricing-query.dto";
import { UpdatePricingDto } from "../dto/update-pricing.dto";
import { PricingService } from "../services/pricing.service";

@Controller("admin/vehicle-category-pricing")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleKey.SUPER_ADMIN)
export class PricingController {
  constructor(
    @Inject(PricingService)
    private readonly pricingService: PricingService,
  ) {}

  @Get()
  findAll(@Query() query: PricingQueryDto) {
    return this.pricingService.findAll(query);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.pricingService.findById(id);
  }

  @Post()
  create(@Body() body: CreatePricingDto) {
    return this.pricingService.create(body);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() body: UpdatePricingDto) {
    return this.pricingService.update(id, body);
  }

  @Delete("bulk")
  bulkRemove(@Body() body: BulkDeleteDto) {
    return this.pricingService.bulkRemove(body);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.pricingService.remove(id);
  }
}

export { PricingController as VehicleCategoryPricingController };
