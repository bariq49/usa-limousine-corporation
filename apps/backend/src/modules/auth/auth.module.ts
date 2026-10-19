import { Module, forwardRef } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { ConfigService } from "@nestjs/config";
import { DatabaseModule } from "../../infrastructure/database/database.module";
import { EmailModule } from "../../infrastructure/email/email.module";
import { WebsocketCoreModule } from "../../infrastructure/websocket/websocket-core.module";
import { RolesModule } from "../roles/roles.module";
import { SessionsModule } from "../sessions/sessions.module";
import { UsersModule } from "../users/users.module";
import { CustomerModule } from "../customer/customer.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { CsrfGuard } from "./guards/csrf.guard";
import { RolesGuard } from "./guards/roles.guard";
import { AuthEmailQueueService } from "./jobs/auth-email-queue.service";
import { AuthCookieInterceptor } from "./interceptors/auth-cookie.interceptor";
import { AuthEmailService } from "./services/auth-email.service";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { RefreshStrategy } from "./strategies/refresh.strategy";

@Module({
  imports: [
    DatabaseModule,
    UsersModule,
    forwardRef(() => CustomerModule),
    RolesModule,
    forwardRef(() => SessionsModule),
    EmailModule,
    WebsocketCoreModule,
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>("JWT_ACCESS_SECRET"),
      }),
    }),
  ],
  providers: [
    AuthService,
    AuthEmailService,
    AuthEmailQueueService,
    AuthCookieInterceptor,
    JwtStrategy,
    RefreshStrategy,
    RolesGuard,
    CsrfGuard,
  ],
  controllers: [AuthController],
  exports: [AuthEmailService, RolesGuard],
})
export class AuthModule {}
