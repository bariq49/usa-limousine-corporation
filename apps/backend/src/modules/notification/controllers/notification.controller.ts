import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ThrottlerGuard } from "@nestjs/throttler";
import { RoleKey } from "@prisma/client";
import type { Request } from "express";
import { requireUserId, toRequestContext } from "../../../common/utils/to-request-context";
import { Roles } from "../../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { BulkDeleteDto, DeadLetterQueryDto, QueryDto } from "../dto/notification.dto";
import { NotificationService } from "../services/notification.service";
import { RecipientType } from "../types/notification";

@Controller("notifications")
@UseGuards(ThrottlerGuard, JwtAuthGuard, RolesGuard)
@Roles(RoleKey.SUPER_ADMIN)
export class NotificationController {
  constructor(@Inject(NotificationService) private readonly notifications: NotificationService) {}

  @Get()
  list(@Query() query: QueryDto, @Req() request: Request) {
    const recipientId = requireUserId(toRequestContext(request));
    return this.notifications.listWithUnread(query, {
      recipientType: RecipientType.USER,
      recipientId,
    });
  }

  @Get("delivery-status")
  deliveryStatus() {
    return this.notifications.getDeliveryStatus();
  }

  @Get("dead-letters")
  deadLetters(@Query() query: DeadLetterQueryDto) {
    return this.notifications.listDeadLetters(query);
  }

  @Post(":id/retry")
  @HttpCode(HttpStatus.OK)
  retryDeadLetter(@Param("id") id: string, @Req() request: Request) {
    const userId = requireUserId(toRequestContext(request));
    return this.notifications.retryDeadLetter(id, userId);
  }

  @Patch("read-all")
  @HttpCode(HttpStatus.OK)
  markAllRead(@Req() request: Request) {
    const recipientId = requireUserId(toRequestContext(request));
    return this.notifications.markAllRead({
      recipientType: RecipientType.USER,
      recipientId,
    });
  }

  @Patch(":id/read")
  markRead(@Param("id") id: string, @Req() request: Request) {
    const recipientId = requireUserId(toRequestContext(request));
    return this.notifications.markRead({
      recipientType: RecipientType.USER,
      recipientId,
      id,
    });
  }

  @Delete("bulk")
  @HttpCode(HttpStatus.OK)
  removeMany(@Body() body: BulkDeleteDto, @Req() request: Request) {
    const recipientId = requireUserId(toRequestContext(request));
    return this.notifications.removeMany({
      recipientType: RecipientType.USER,
      recipientId,
      ids: body.ids,
    });
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  remove(@Param("id") id: string, @Req() request: Request) {
    const recipientId = requireUserId(toRequestContext(request));
    return this.notifications.remove({
      recipientType: RecipientType.USER,
      recipientId,
      id,
    });
  }
}
