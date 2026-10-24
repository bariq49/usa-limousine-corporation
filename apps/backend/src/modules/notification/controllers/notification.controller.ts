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
import { BulkDeleteDto, QueryDto } from "../dto/notification.dto";
import { TestPushDto } from "../dto/test-push.dto";
import { NotificationService } from "../services/notification.service";
import { TestPushService } from "../services/test-push.service";
import { RecipientType, type Recipient } from "../types/notification";


function adminRecipient(request: Request): Recipient {
  return {
    recipientType: RecipientType.USER,
    recipientId: requireUserId(toRequestContext(request)),
  };
}

@Controller("notifications")
@UseGuards(ThrottlerGuard, JwtAuthGuard, RolesGuard)
@Roles(RoleKey.SUPER_ADMIN)
export class NotificationController {
  constructor(
    @Inject(NotificationService) private readonly notifications: NotificationService,
    @Inject(TestPushService) private readonly testPush: TestPushService,
  ) {}

  @Get()
  list(@Query() query: QueryDto, @Req() request: Request) {
    return this.notifications.listWithUnread(query, adminRecipient(request));
  }

  @Post("test")
  @HttpCode(HttpStatus.OK)
  test(@Body() body: TestPushDto) {
    return this.testPush.test({ token: body.token.trim() });
  }

  @Patch("read-all")
  @HttpCode(HttpStatus.OK)
  markAllRead(@Req() request: Request) {
    return this.notifications.markAllRead(adminRecipient(request));
  }

  @Patch(":id/read")
  markRead(@Param("id") id: string, @Req() request: Request) {
    const recipient = adminRecipient(request);
    return this.notifications.markRead({
      recipientType: recipient.recipientType,
      recipientId: recipient.recipientId,
      id,
    });
  }

  @Delete("bulk")
  @HttpCode(HttpStatus.OK)
  removeMany(@Body() body: BulkDeleteDto, @Req() request: Request) {
    const recipient = adminRecipient(request);
    return this.notifications.removeMany({
      recipientType: recipient.recipientType,
      recipientId: recipient.recipientId,
      ids: body.ids,
    });
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  remove(@Param("id") id: string, @Req() request: Request) {
    const recipient = adminRecipient(request);
    return this.notifications.remove({
      recipientType: recipient.recipientType,
      recipientId: recipient.recipientId,
      id,
    });
  }
}
