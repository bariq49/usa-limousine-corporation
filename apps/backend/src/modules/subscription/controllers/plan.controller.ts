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
import { CreateDto } from "../dto/create.dto";
import { QueryDto } from "../dto/query.dto";
import { UpdateDto } from "../dto/update.dto";
import { PlanService } from "../services/plan.service";

@Controller("admin/plans")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleKey.SUPER_ADMIN)
export class PlanController {
  constructor(@Inject(PlanService) private readonly plans: PlanService) {}

  @Get()
  findAll(@Query() query: QueryDto) {
    return this.plans.findAll(query);
  }

  @Get(":id")
  findById(@Param("id") id: string) {
    return this.plans.findById(id);
  }

  @Post()
  create(@Body() body: CreateDto) {
    return this.plans.create(body);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() body: UpdateDto) {
    return this.plans.update(id, body);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.plans.remove(id);
  }
}
