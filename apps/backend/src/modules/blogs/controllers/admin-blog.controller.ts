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
import { CreateDto, QueryDto, UpdateDto } from "../dto/blog.dto";
import { BlogService } from "../services/blog.service";

@Controller("admin/blogs")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleKey.SUPER_ADMIN)
export class AdminBlogController {
  constructor(@Inject(BlogService) private readonly blogs: BlogService) {}

  @Get()
  list(@Query() query: QueryDto) {
    return this.blogs.list(query);
  }

  @Get(":id")
  getOne(@Param("id") id: string) {
    return this.blogs.getOne(id);
  }

  @Post()
  create(@Body() body: CreateDto, @Req() request: Request) {
    return this.blogs.create(body, request);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() body: UpdateDto, @Req() request: Request) {
    return this.blogs.update(id, body, request);
  }

  @Delete(":id")
  remove(@Param("id") id: string, @Req() request: Request) {
    return this.blogs.remove(id, request);
  }
}
