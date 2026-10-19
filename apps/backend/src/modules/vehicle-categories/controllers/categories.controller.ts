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
import { CreateDto } from "../dto/create.dto";
import { VehicleCategoryQueryDto } from "../dto/query.dto";
import { UpdateDto } from "../dto/update.dto";
import { CategoriesService } from "../services/categories.service";

@Controller("admin/vehicle-categories")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleKey.SUPER_ADMIN)
export class CategoriesController {
  constructor(
    @Inject(CategoriesService)
    private readonly categoriesService: CategoriesService,
  ) {}

  @Get()
  findAll(@Query() query: VehicleCategoryQueryDto) {
    return this.categoriesService.findAll(query);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.categoriesService.findById(id);
  }

  @Post()
  create(@Body() body: CreateDto) {
    return this.categoriesService.create(body);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() body: UpdateDto) {
    return this.categoriesService.update(id, body);
  }

  @Delete("bulk")
  bulkRemove(@Body() body: BulkDeleteDto) {
    return this.categoriesService.bulkRemove(body);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.categoriesService.remove(id);
  }
}
