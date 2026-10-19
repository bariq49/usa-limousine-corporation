import { Body, Controller, HttpCode, HttpStatus, Inject, Post, UseGuards } from "@nestjs/common";
import { RoleKey } from "@prisma/client";
import { Roles } from "../../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { TestPushDto } from "../dto/test-push.dto";
import { TestPushService } from "../services/test-push.service";

@Controller("notifications")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleKey.SUPER_ADMIN)
export class NotificationController {
  constructor(@Inject(TestPushService) private readonly testPush: TestPushService) {}

  @Post("test")
  @HttpCode(HttpStatus.OK)
  test(@Body() body: TestPushDto) {
    return this.testPush.test({ token: body.token.trim() });
  }
}
