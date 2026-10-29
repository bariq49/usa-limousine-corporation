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
import { CommentQueryDto, ReplyCommentDto, UpdateCommentDto } from "../dto/blog.dto";
import { CommentService } from "../services/comment.service";

@Controller("admin/blog-comments")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleKey.SUPER_ADMIN)
export class AdminCommentController {
  constructor(@Inject(CommentService) private readonly comments: CommentService) {}

  @Get()
  list(@Query() query: CommentQueryDto) {
    return this.comments.list(query);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() body: UpdateCommentDto, @Req() request: Request) {
    return this.comments.updateStatus(id, body, request);
  }

  @Post(":id/reply")
  reply(@Param("id") id: string, @Body() body: ReplyCommentDto, @Req() request: Request) {
    return this.comments.reply(id, body, request);
  }

  @Delete(":id")
  remove(@Param("id") id: string, @Req() request: Request) {
    return this.comments.remove(id, request);
  }
}
