import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Patch,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import type { Request } from "express";
import {
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
import { AuthService } from "./auth.service";
import { AuthCookie } from "./decorators/auth-cookie.decorator";
import { CsrfCookie } from "./decorators/csrf-cookie.decorator";
import { CsrfGuard } from "./guards/csrf.guard";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { RefreshAuthGuard } from "./guards/refresh-auth.guard";
import { AuthCookieInterceptor } from "./interceptors/auth-cookie.interceptor";
import type { JwtAuthRequest, RefreshAuthRequest } from "./types/request-context";

@Controller("auth")
@UseInterceptors(AuthCookieInterceptor)
export class AuthController {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

  @Get("csrf")
  @HttpCode(HttpStatus.OK)
  @CsrfCookie()
  issueCsrf() {
    return this.authService.issueCsrf();
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  me(@Req() request: JwtAuthRequest) {
    return this.authService.me(request);
  }

  @Post("register")
  async register(@Body() body: RegisterDto, @Req() request: Request) {
    await this.authService.register(body, request);
    const viaSms = body.channel === "sms";
    return {
      message: viaSms
        ? "Registration successful. Verify with the code sent by SMS."
        : "Registration successful. Verify your email.",
      channel: viaSms ? "sms" : "email",
    };
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @AuthCookie("set")
  async login(@Body() body: LoginDto, @Req() request: Request) {
    return this.authService.login(body, request);
  }

  @Post("refresh")
  @UseGuards(CsrfGuard, RefreshAuthGuard)
  @HttpCode(HttpStatus.OK)
  @AuthCookie("set")
  async refresh(@Body() body: RefreshDto, @Req() request: RefreshAuthRequest) {
    return this.authService.refresh(body, request);
  }

  @Post("logout")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @AuthCookie("clear")
  async logout(@Req() request: JwtAuthRequest) {
    await this.authService.logout(request);
    return { message: "Logged out" };
  }

  @Post("logout-all")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @AuthCookie("clear")
  async logoutAll(@Req() request: JwtAuthRequest) {
    await this.authService.logoutAll(request);
    return { message: "Logged out from all devices" };
  }

  @Post("verify-email")
  async verifyEmail(@Body() body: VerifyEmailDto, @Req() request: Request) {
    await this.authService.verifyEmail(body, request);
    return { message: "Email verified" };
  }

  @Post("resend-otp")
  async resendOtp(@Body() body: ResendOtpDto, @Req() request: Request) {
    await this.authService.resendOtp(body, request);
    const viaSms = body.channel === "sms";
    return {
      message: viaSms ? "Verification code sent by SMS" : "Verification code sent to email",
      channel: viaSms ? "sms" : "email",
    };
  }

  @Post("forgot-password")
  async forgotPassword(@Body() body: ForgotPasswordDto, @Req() request: Request) {
    await this.authService.forgotPassword(body, request);
    const viaSms = body.channel === "sms";
    return {
      message: viaSms
        ? "If the account exists, a verification code has been sent by SMS."
        : "If the account exists, a verification code has been sent to your email.",
      channel: viaSms ? "sms" : "email",
    };
  }

  @Post("verify-reset-otp")
  async verifyResetOtp(@Body() body: VerifyResetOtpDto, @Req() request: Request) {
    const result = await this.authService.verifyResetOtp(body, request);
    return {
      message: "Verification code confirmed. You can now set a new password.",
      resetToken: result.resetToken,
    };
  }

  @Post("reset-password")
  async resetPassword(@Body() body: ResetPasswordDto, @Req() request: Request) {
    await this.authService.resetPassword(body, request);
    return { message: "Password reset successful. Please log in with your new password." };
  }

  @Post("change-password")
  @UseGuards(JwtAuthGuard)
  @AuthCookie("clear")
  async changePassword(@Body() body: ChangePasswordDto, @Req() request: JwtAuthRequest) {
    await this.authService.changePassword(body, request);
    return { message: "Password changed" };
  }

  @Patch("profile")
  @UseGuards(JwtAuthGuard)
  async updateProfile(@Body() body: UpdateProfileDto, @Req() request: JwtAuthRequest) {
    return this.authService.updateProfile(body, request);
  }
}
