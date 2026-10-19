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
import { QueryDto } from "../dto/query.dto";
import { UpdateDto } from "../dto/update.dto";
import { ExtraServiceService } from "../services/extra-service.service";

@Controller("admin/extra-services")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleKey.SUPER_ADMIN)
export class AdminController {
  constructor(
    @Inject(ExtraServiceService)
    private readonly service: ExtraServiceService,
  ) {}

  @Get()
  findAll(@Query() query: QueryDto) {
    return this.service.findAll(query);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.service.findById(id);
  }

  @Post()
  create(@Body() body: CreateDto) {
    return this.service.create(body);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() body: UpdateDto) {
    return this.service.update(id, body);
  }

  @Delete("bulk")
  bulkRemove(@Body() body: BulkDeleteDto) {
    return this.service.bulkRemove(body);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.service.remove(id);
  }
}
