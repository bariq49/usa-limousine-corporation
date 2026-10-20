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
import { CreateDto } from "../dto/create-luggage.dto";
import { QueryDto } from "../dto/luggage-query.dto";
import { UpdateLuggageDto } from "../dto/update-luggage.dto";
import { LuggageService } from "../services/luggage.service";

@Controller("admin/luggage")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleKey.SUPER_ADMIN)
export class LuggageController {
  constructor(
    @Inject(LuggageService)
    private readonly luggageService: LuggageService,
  ) {}

  @Get()
  findAll(@Query() query: QueryDto) {
    return this.luggageService.findAll(query);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.luggageService.findById(id);
  }

  @Post()
  create(@Body() body: CreateDto) {
    return this.luggageService.create(body);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() body: UpdateLuggageDto) {
    return this.luggageService.update(id, body);
  }

  @Delete("bulk")
  bulkRemove(@Body() body: BulkDeleteDto) {
    return this.luggageService.bulkRemove(body);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.luggageService.remove(id);
  }
}
