import { randomBytes } from "crypto";
import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
  forwardRef,
  type OnModuleInit,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import * as argon2 from "argon2";
import { PrismaService } from "../../infrastructure/database/prisma.service";
import { DEFAULT_ROLE_KEYS } from "../roles/constants/roles.constants";
import { RolesService } from "../roles/services/roles.service";
import { SessionsService } from "../sessions/services/sessions.service";
import { UsersService } from "../users/users.service";
import { CustomerService } from "../customer/services/customer.service";
import type {
  ChangePasswordDto,
  ForgotPasswordDto,
  LoginDto,
  RefreshDto,
  RegisterDto,
  ResendOtpDto,
  ResetPasswordDto,
  UpdateProfileDto,
  VerifyEmailDto,
  VerifyResetOtpDto,
} from "./dto/auth.dto";
import { AuthEmailService } from "./services/auth-email.service";
import { AUTH_EMAIL_TTL } from "./constants/auth.constants";
import type { AuthRequest, JwtAuthRequest, RefreshAuthRequest } from "./types/request-context";
import type { CurrentUser } from "./types/current-user";
import type { IssueSessionTokens } from "./types/issue-session-tokens";
import type { SignAccessToken } from "./types/access-token";
import { createCsrfToken } from "./utils/csrf";
import { hashToken } from "./utils/hash-token";
import { toRequestContext } from "../../common/utils/to-request-context";
import { auditLog } from "../../common/utils/audit-log";

@Injectable()
export class AuthService implements OnModuleInit {
  private dummyPasswordHash!: string;

  constructor(
    @Inject(UsersService) private readonly usersService: UsersService,
    @Inject(forwardRef(() => CustomerService)) private readonly customers: CustomerService,
    @Inject(RolesService) private readonly rolesService: RolesService,
    @Inject(SessionsService) private readonly sessionsService: SessionsService,
    @Inject(JwtService) private readonly jwtService: JwtService,
    @Inject(ConfigService) private readonly configService: ConfigService,
    @Inject(AuthEmailService) private readonly authEmails: AuthEmailService,
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

  async onModuleInit() {
    this.dummyPasswordHash = await argon2.hash("invalid-credentials-timing-pad");
    await this.rolesService.ensureDefaults();
  }

  issueCsrf() {
    return { csrfToken: createCsrfToken() };
  }

  async register(body: RegisterDto, request: AuthRequest) {
    const { email, password, firstName, lastName, phone, channel } = body;
    const context = toRequestContext(request);

    if (channel === "sms" && !phone?.trim()) {
      throw new BadRequestException("Phone number is required for SMS OTP");
    }

    const existing = await this.usersService.findByEmail({ email });
    if (existing) {
      await auditLog({
        prisma: this.prisma,
        event: "auth.register",
        context,
        result: "failure",
        metadata: { reason: "email_exists" },
      });
      return;
    }

    const passwordHash = await argon2.hash(password);
    const user = await this.usersService.create({
      email,
      passwordHash,
      firstName: firstName ?? null,
      lastName: lastName ?? null,
      phone: phone ?? null,
    });
    await this.rolesService.assignRoles({ userId: user.id, keys: DEFAULT_ROLE_KEYS });
    const customer = await this.customers.create({ userId: user.id });
    await this.authEmails.sendVerificationEmail({
      userId: user.id,
      email: user.email,
      phone: user.phone,
      channel: channel ?? "email",
    });
    await auditLog({
      prisma: this.prisma,
      event: "auth.register",
      context,
      userId: user.id,
      result: "success",
      metadata: {
        email: user.email,
        channel: channel ?? "email",
        customerId: customer.id,
        customerType: customer.type,
      },
    });
  }

  async login(body: LoginDto, request: AuthRequest) {
    const { email, password } = body;
    const context = toRequestContext(request);
    const user = await this.usersService.findByEmail({ email });
    const passwordHash = user?.passwordHash ?? this.dummyPasswordHash;
    const valid = await argon2.verify(passwordHash, password);

    if (!user || !user.isActive || !valid) {
      if (user?.isActive && !valid) {
        const maxAttempts = this.configService.getOrThrow<number>("AUTH_LOGIN_MAX_ATTEMPTS");
        const lockoutMinutes = this.configService.getOrThrow<number>("AUTH_LOCKOUT_MINUTES");
        const next = user.failedLoginCount + 1;
        const lockoutUntil =
          next >= maxAttempts ? new Date(Date.now() + lockoutMinutes * 60 * 1000) : null;

        await this.usersService.updateLoginFailure({
          userId: user.id,
          failedLoginCount: next,
          lockoutUntil,
        });

        if (lockoutUntil) {
          await auditLog({
            prisma: this.prisma,
            event: "auth.account_lockout",
            context,
            userId: user.id,
            result: "success",
            metadata: { failedLoginCount: next },
          });
        }
      }

      await auditLog({
        prisma: this.prisma,
        event: "auth.login",
        context,
        userId: user?.id,
        result: "failure",
        metadata: { reason: "invalid_credentials" },
      });
      throw new UnauthorizedException("Invalid credentials");
    }

    if (user.lockoutUntil && user.lockoutUntil > new Date()) {
      await auditLog({
        prisma: this.prisma,
        event: "auth.login",
        context,
        userId: user.id,
        result: "failure",
        metadata: { reason: "account_locked" },
      });
      throw new ForbiddenException("Account is temporarily locked");
    }

    if (!user.isEmailVerified) {
      await auditLog({
        prisma: this.prisma,
        event: "auth.login",
        context,
        userId: user.id,
        result: "failure",
        metadata: { reason: "email_not_verified" },
      });
      throw new ForbiddenException("Verify your email before signing in");
    }

    await this.usersService.updateLoginFailure({
      userId: user.id,
      failedLoginCount: 0,
      lockoutUntil: null,
    });

    const rememberMe = body.rememberMe === true;
    const tokens = await this.issueSessionTokens({
      userId: user.id,
      email: user.email,
      deviceId: context.deviceId?.trim() || "unknown-device",
      ipAddress: context.ipAddress ?? null,
      userAgent: context.userAgent ?? null,
      rememberMe,
    });

    await auditLog({
      prisma: this.prisma,
      event: "auth.login",
      context,
      userId: user.id,
      sessionId: tokens.sessionId,
      result: "success",
      metadata: { deviceId: context.deviceId?.trim() || "unknown-device", rememberMe },
    });

    return tokens;
  }

  async me(request: JwtAuthRequest): Promise<CurrentUser> {
    const user = await this.usersService.findById({ id: request.user.sub });
    if (!user) {
      throw new UnauthorizedException("Session is invalid");
    }

    const firstName = user.firstName || null;
    const lastName = user.lastName || null;
    const name = [firstName, lastName].filter(Boolean).join(" ").trim() || null;
    const phone = user.phone || null;
    const avatar = user.avatar || null;

    return {
      id: user.id,
      firstName,
      lastName,
      name,
      email: user.email,
      phone,
      roles: request.user.roles,
      isEmailVerified: user.isEmailVerified,
      isActive: user.isActive,
      createdAt: user.createdAt,
      memberSince: user.createdAt,
      sessionId: request.user.sid,
      avatar,
    };
  }

  async updateProfile(body: UpdateProfileDto, request: JwtAuthRequest): Promise<CurrentUser> {
    const userId = request.user.sub;
    const user = await this.usersService.findById({ id: userId });
    if (!user) {
      throw new UnauthorizedException("Session is invalid");
    }

    await this.usersService.updateProfile({
      userId,
      firstName: body.firstName,
      lastName: body.lastName,
      phone: body.phone,
      avatar: body.avatar,
    });

    const context = toRequestContext(request);
    await auditLog({
      prisma: this.prisma,
      event: "auth.profile_update",
      context,
      userId: user.id,
      result: "success",
      metadata: {
        firstName: body.firstName,
        lastName: body.lastName,
        phone: body.phone,
        avatar: body.avatar,
      },
    });

    return this.me(request);
  }

  async refresh(body: RefreshDto, request: RefreshAuthRequest) {
    const { sub, sid, email } = request.user;
    const currentRefreshToken = request.user.refreshToken ?? body.refreshToken;
    const context = toRequestContext(request);

    if (!currentRefreshToken) {
      throw new UnauthorizedException("Refresh token invalid");
    }

    const session = await this.sessionsService.getById({ id: sid });
    if (!session || session.userId !== sub || session.revokedAt || !session.refreshTokenHash) {
      await auditLog({
        prisma: this.prisma,
        event: "auth.refresh",
        context,
        userId: sub,
        sessionId: sid,
        result: "failure",
        metadata: { reason: "session_invalid" },
      });
      throw new UnauthorizedException("Session is invalid");
    }

    if (session.expiresAt <= new Date()) {
      await this.sessionsService.revokeCurrent({ sessionId: session.id });
      await auditLog({
        prisma: this.prisma,
        event: "auth.refresh",
        context,
        userId: sub,
        sessionId: session.id,
        result: "failure",
        metadata: { reason: "session_expired" },
      });
      throw new UnauthorizedException("Session expired");
    }

    const user = await this.usersService.findById({ id: sub });
    if (!user || !user.isActive || !user.isEmailVerified) {
      await this.sessionsService.revokeCurrent({ sessionId: session.id });
      await auditLog({
        prisma: this.prisma,
        event: "auth.refresh",
        context,
        userId: sub,
        sessionId: session.id,
        result: "failure",
        metadata: { reason: "user_invalid" },
      });
      throw new UnauthorizedException("Session is invalid");
    }

    const valid = await argon2.verify(session.refreshTokenHash, currentRefreshToken);
    if (!valid) {
      await this.sessionsService.revokeCurrent({ sessionId: session.id });
      await auditLog({
        prisma: this.prisma,
        event: "auth.refresh",
        context,
        userId: sub,
        sessionId: session.id,
        result: "failure",
        metadata: { reason: "refresh_replay_or_invalid" },
      });
      throw new UnauthorizedException("Refresh token invalid");
    }

    const rememberMe = request.user.rm === true;
    const accessTtl = this.configService.getOrThrow<number>("JWT_ACCESS_TTL_SECONDS");
    const refreshTtl = this.resolveRefreshTtlSeconds(rememberMe);
    const refreshExpiresAt = new Date(Date.now() + refreshTtl * 1000);
    const accessToken = this.signAccessToken({
      sub,
      email,
      sid: session.id,
      rememberMe,
      accessTtl,
    });
    const refreshToken = this.signRefreshToken({
      sub,
      email,
      sid: session.id,
      rememberMe,
      refreshTtl,
    });

    const rotated = await this.sessionsService.rotateRefreshToken({
      sessionId: session.id,
      currentTokenHash: session.refreshTokenHash,
      tokenHash: await argon2.hash(refreshToken),
      expiresAt: refreshExpiresAt,
    });
    if (!rotated) {
      await this.sessionsService.revokeCurrent({ sessionId: session.id });
      await auditLog({
        prisma: this.prisma,
        event: "auth.refresh",
        context,
        userId: sub,
        sessionId: session.id,
        result: "failure",
        metadata: { reason: "refresh_replay_or_concurrent_rotation" },
      });
      throw new UnauthorizedException("Refresh token invalid");
    }

    await auditLog({
      prisma: this.prisma,
      event: "auth.refresh",
      context,
      userId: sub,
      sessionId: session.id,
      result: "success",
    });

    return {
      accessToken,
      refreshToken,
      sessionId: session.id,
      refreshExpiresAt,
    };
  }

  async logout(request: JwtAuthRequest) {
    const { sid: sessionId, sub: userId } = request.user;
    const context = toRequestContext(request);
    const session = await this.sessionsService.getById({ id: sessionId });
    if (!session || session.userId !== userId) {
      return;
    }

    await this.sessionsService.revokeCurrent({ sessionId });
    await auditLog({
      prisma: this.prisma,
      event: "auth.logout",
      context,
      userId,
      sessionId,
      result: "success",
    });
  }

  async logoutAll(request: JwtAuthRequest) {
    const { sub: userId } = request.user;
    const context = toRequestContext(request);
    await this.sessionsService.revokeAll({ userId });
    await auditLog({
      prisma: this.prisma,
      event: "auth.logout_all",
      context,
      userId,
      result: "success",
    });
  }

  async forgotPassword(body: ForgotPasswordDto, request: AuthRequest) {
    const { email, channel } = body;
    const context = toRequestContext(request);
    const user = await this.usersService.findByEmail({ email });
    if (!user) {
      await auditLog({
        prisma: this.prisma,
        event: "auth.password_reset_requested",
        context,
        result: "success",
        metadata: { reason: "unknown_email", channel: channel ?? "email" },
      });
      return;
    }

    if (channel === "sms" && !user.phone?.trim()) {
      await auditLog({
        prisma: this.prisma,
        event: "auth.password_reset_requested",
        context,
        userId: user.id,
        result: "success",
        metadata: { reason: "missing_phone", channel: "sms" },
      });
      return;
    }

    await this.authEmails.sendPasswordResetEmail({
      userId: user.id,
      email: user.email,
      phone: user.phone,
      channel: channel ?? "email",
    });
    await auditLog({
      prisma: this.prisma,
      event: "auth.password_reset_requested",
      context,
      userId: user.id,
      result: "success",
      metadata: { channel: channel ?? "email" },
    });
  }

  async verifyResetOtp(body: VerifyResetOtpDto, request: AuthRequest) {
    const { email, otp } = body;
    const context = toRequestContext(request);
    const user = await this.usersService.findByEmail({ email });
    if (!user) {
      await auditLog({
        prisma: this.prisma,
        event: "auth.password_reset_otp_verified",
        context,
        result: "failure",
        metadata: { reason: "invalid_otp" },
      });
      throw new BadRequestException("Invalid or expired verification code");
    }

    const otpToken = await this.prisma.passwordResetToken.findFirst({
      where: {
        userId: user.id,
        tokenHash: hashToken(otp.trim()),
        consumedAt: null,
        expiresAt: { gt: new Date() },
      },
    });
    if (!otpToken) {
      await auditLog({
        prisma: this.prisma,
        event: "auth.password_reset_otp_verified",
        context,
        userId: user.id,
        result: "failure",
        metadata: { reason: "invalid_otp" },
      });
      throw new BadRequestException("Invalid or expired verification code");
    }

    await this.prisma.passwordResetToken.updateMany({
      where: { userId: user.id, consumedAt: null },
      data: { consumedAt: new Date() },
    });

    const resetToken = randomBytes(32).toString("hex");
    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(resetToken),
        expiresAt: new Date(Date.now() + 1000 * 60 * AUTH_EMAIL_TTL.PASSWORD_RESET_SESSION_MINUTES),
      },
    });

    await auditLog({
      prisma: this.prisma,
      event: "auth.password_reset_otp_verified",
      context,
      userId: user.id,
      result: "success",
    });

    return { resetToken };
  }

  async resetPassword(body: ResetPasswordDto, request: AuthRequest) {
    const { email, resetToken, newPassword } = body;
    const context = toRequestContext(request);
    const user = await this.usersService.findByEmail({ email });
    if (!user) {
      await auditLog({
        prisma: this.prisma,
        event: "auth.password_reset_completed",
        context,
        result: "failure",
        metadata: { reason: "invalid_token" },
      });
      throw new BadRequestException("Invalid or expired reset token");
    }

    const token = await this.prisma.passwordResetToken.findFirst({
      where: {
        userId: user.id,
        tokenHash: hashToken(resetToken),
        consumedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (!token) {
      await auditLog({
        prisma: this.prisma,
        event: "auth.password_reset_completed",
        context,
        userId: user.id,
        result: "failure",
        metadata: { reason: "invalid_token" },
      });
      throw new BadRequestException("Invalid or expired reset token");
    }

    await this.usersService.updatePassword({
      userId: user.id,
      passwordHash: await argon2.hash(newPassword),
    });
    await this.prisma.passwordResetToken.updateMany({
      where: { userId: user.id, consumedAt: null },
      data: { consumedAt: new Date() },
    });
    await this.sessionsService.revokeAll({ userId: user.id });
    await auditLog({
      prisma: this.prisma,
      event: "auth.password_reset_completed",
      context,
      userId: user.id,
      result: "success",
    });
  }

  async verifyEmail(body: VerifyEmailDto, request: AuthRequest) {
    const { token, email } = body;
    const context = toRequestContext(request);

    const user = await this.usersService.findByEmail({ email });
    if (!user) {
      await auditLog({
        prisma: this.prisma,
        event: "auth.email_verified",
        context,
        result: "failure",
        metadata: { reason: "invalid_token" },
      });
      throw new BadRequestException("Invalid verification token");
    }

    const verification = await this.prisma.emailVerificationToken.findFirst({
      where: {
        userId: user.id,
        tokenHash: hashToken(token),
        consumedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (!verification) {
      await auditLog({
        prisma: this.prisma,
        event: "auth.email_verified",
        context,
        result: "failure",
        metadata: { reason: "invalid_token" },
      });
      throw new BadRequestException("Invalid verification token");
    }

    await this.prisma.emailVerificationToken.updateMany({
      where: { userId: user.id, consumedAt: null },
      data: { consumedAt: new Date() },
    });
    await this.usersService.markEmailVerified({ userId: user.id });

    await auditLog({
      prisma: this.prisma,
      event: "auth.email_verified",
      context,
      userId: user.id,
      result: "success",
    });

    return { userId: user.id };
  }

  async resendOtp(body: ResendOtpDto, request: AuthRequest) {
    const { email, channel } = body;
    const context = toRequestContext(request);
    const user = await this.usersService.findByEmail({ email });
    if (!user) {
      await auditLog({
        prisma: this.prisma,
        event: "auth.otp_resent",
        context,
        result: "success",
        metadata: { reason: "unknown_email", channel: channel ?? "email" },
      });
      return;
    }

    if (user.isEmailVerified) {
      await auditLog({
        prisma: this.prisma,
        event: "auth.otp_resent",
        context,
        userId: user.id,
        result: "success",
        metadata: { reason: "already_verified", channel: channel ?? "email" },
      });
      return;
    }

    if (channel === "sms" && !user.phone?.trim()) {
      await auditLog({
        prisma: this.prisma,
        event: "auth.otp_resent",
        context,
        userId: user.id,
        result: "success",
        metadata: { reason: "missing_phone", channel: "sms" },
      });
      return;
    }

    await this.authEmails.sendVerificationEmail({
      userId: user.id,
      email: user.email,
      phone: user.phone,
      channel: channel ?? "email",
    });
    await auditLog({
      prisma: this.prisma,
      event: "auth.otp_resent",
      context,
      userId: user.id,
      result: "success",
      metadata: { channel: channel ?? "email" },
    });

    return { userId: user.id };
  }

  async changePassword(body: ChangePasswordDto, request: JwtAuthRequest) {
    const { currentPassword, newPassword } = body;
    const { sub: userId } = request.user;
    const context = toRequestContext(request);
    const user = await this.usersService.findById({ id: userId });
    if (!user) {
      throw new UnauthorizedException();
    }

    const valid = await argon2.verify(user.passwordHash, currentPassword);
    if (!valid) {
      await auditLog({
        prisma: this.prisma,
        event: "auth.password_changed",
        context,
        userId,
        result: "failure",
        metadata: { reason: "invalid_current_password" },
      });
      throw new UnauthorizedException("Current password is incorrect");
    }

    await this.usersService.updatePassword({
      userId,
      passwordHash: await argon2.hash(newPassword),
    });
    await this.sessionsService.revokeAll({ userId });
    await auditLog({
      prisma: this.prisma,
      event: "auth.password_changed",
      context,
      userId,
      result: "success",
    });
  }

  private resolveRefreshTtlSeconds(rememberMe: boolean): number {
    if (rememberMe) {
      return this.configService.getOrThrow<number>("JWT_REMEMBER_ME_TTL_SECONDS");
    }

    return this.configService.getOrThrow<number>("JWT_REFRESH_TTL_SECONDS");
  }

  private async issueSessionTokens(input: IssueSessionTokens) {
    const accessTtl = this.configService.getOrThrow<number>("JWT_ACCESS_TTL_SECONDS");
    const refreshTtl = this.resolveRefreshTtlSeconds(input.rememberMe);
    const refreshExpiresAt = new Date(Date.now() + refreshTtl * 1000);
    const initialRefreshTokenHash = await argon2.hash(randomBytes(32).toString("hex"));

    const session = await this.sessionsService.create({
      userId: input.userId,
      deviceId: input.deviceId,
      refreshTokenHash: initialRefreshTokenHash,
      expiresAt: refreshExpiresAt,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    });

    await this.sessionsService.revokeOthers({
      userId: input.userId,
      exceptSessionId: session.id,
    });

    const accessToken = this.signAccessToken({
      sub: input.userId,
      email: input.email,
      sid: session.id,
      rememberMe: input.rememberMe,
      accessTtl,
    });
    const refreshToken = this.signRefreshToken({
      sub: input.userId,
      email: input.email,
      sid: session.id,
      rememberMe: input.rememberMe,
      refreshTtl,
    });

    const created = await this.sessionsService.rotateRefreshToken({
      sessionId: session.id,
      currentTokenHash: initialRefreshTokenHash,
      tokenHash: await argon2.hash(refreshToken),
      expiresAt: refreshExpiresAt,
    });
    if (!created) {
      throw new Error("Failed to initialize refresh session");
    }

    return {
      accessToken,
      refreshToken,
      sessionId: session.id,
      refreshExpiresAt,
    };
  }

  private signAccessToken(input: SignAccessToken) {
    const payload = {
      sub: input.sub,
      email: input.email,
      sid: input.sid,
      rm: input.rememberMe,
    };

    return this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow<string>("JWT_ACCESS_SECRET"),
      expiresIn: input.accessTtl,
    });
  }

  private signRefreshToken(input: {
    sub: string;
    email: string;
    sid: string;
    rememberMe: boolean;
    refreshTtl: number;
  }) {
    const payload = {
      sub: input.sub,
      email: input.email,
      sid: input.sid,
      jti: randomBytes(16).toString("hex"),
      rm: input.rememberMe,
    };

    return this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow<string>("JWT_REFRESH_SECRET"),
      expiresIn: input.refreshTtl,
    });
  }
}
