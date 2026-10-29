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
  Req,
  UseGuards,
} from "@nestjs/common";
import { RoleKey } from "@prisma/client";
import type { Request } from "express";
import { Roles } from "../../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { CreateTaxonomyDto, TaxonomyQueryDto, UpdateTaxonomyDto } from "../dto/blog.dto";
import { TaxonomyService } from "../services/taxonomy.service";

@Controller("admin")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleKey.SUPER_ADMIN)
export class AdminTaxonomyController {
  constructor(@Inject(TaxonomyService) private readonly taxonomy: TaxonomyService) {}

  @Get("blog-categories")
  listCategories(@Query() query: TaxonomyQueryDto) {
    return this.taxonomy.listCategories(query);
  }

  @Get("blog-categories/:id")
  getCategory(@Param("id") id: string) {
    return this.taxonomy.getCategory(id);
  }

  @Post("blog-categories")
  createCategory(@Body() body: CreateTaxonomyDto, @Req() request: Request) {
    return this.taxonomy.createCategory(body, request);
  }

  @Patch("blog-categories/:id")
  updateCategory(@Param("id") id: string, @Body() body: UpdateTaxonomyDto, @Req() request: Request) {
    return this.taxonomy.updateCategory(id, body, request);
  }

  @Delete("blog-categories/:id")
  removeCategory(@Param("id") id: string, @Req() request: Request) {
    return this.taxonomy.removeCategory(id, request);
  }

  @Get("blog-tags")
  listTags(@Query() query: TaxonomyQueryDto) {
    return this.taxonomy.listTags(query);
  }

  @Get("blog-tags/:id")
  getTag(@Param("id") id: string) {
    return this.taxonomy.getTag(id);
  }

  @Post("blog-tags")
  createTag(@Body() body: CreateTaxonomyDto, @Req() request: Request) {
    return this.taxonomy.createTag(body, request);
  }

  @Patch("blog-tags/:id")
  updateTag(@Param("id") id: string, @Body() body: UpdateTaxonomyDto, @Req() request: Request) {
    return this.taxonomy.updateTag(id, body, request);
  }

  @Delete("blog-tags/:id")
  removeTag(@Param("id") id: string, @Req() request: Request) {
    return this.taxonomy.removeTag(id, request);
  }
}
