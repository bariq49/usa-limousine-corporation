import {
  BadRequestException,
  Inject,
  Injectable,
  ServiceUnavailableException,
  forwardRef,
} from "@nestjs/common";
import { createOtp } from "../../../common/utils/create-otp";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import { EmailService } from "../../../infrastructure/email/email.service";
import type { PasswordReset, Verification } from "../../../infrastructure/email/types/auth";
import { TwilioService } from "../../../infrastructure/twilio/twilio.service";
import { AUTH_EMAIL_TTL } from "../constants/auth.constants";
import { AuthEmailQueueService } from "../jobs/auth-email-queue.service";
import type {
  Channel,
  SendPasswordReset,
  SendVerification,
  SmsPayload,
} from "../types/auth-email.jobs";
import { hashToken } from "../utils/hash-token";
import { PLATFORM } from "@usa-limousine-corporation/config";

@Injectable()
export class AuthEmailService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(EmailService) private readonly emailService: EmailService,
    @Inject(TwilioService) private readonly twilio: TwilioService,
    @Inject(forwardRef(() => AuthEmailQueueService))
    private readonly queue: AuthEmailQueueService,
  ) {}

  async sendVerificationEmail(params: SendVerification) {
    const channel = this.resolveChannel(params.channel);
    const token = createOtp();

    await this.prisma.emailVerificationToken.updateMany({
      where: { userId: params.userId, consumedAt: null },
      data: { consumedAt: new Date() },
    });
    await this.prisma.emailVerificationToken.create({
      data: {
        userId: params.userId,
        tokenHash: hashToken(token),
        expiresAt: new Date(Date.now() + 1000 * 60 * AUTH_EMAIL_TTL.OTP_MINUTES),
      },
    });

    await this.deliverOtp({
      channel,
      email: params.email,
      phone: params.phone ?? null,
      token,
      kind: "verification",
    });
  }

  async sendPasswordResetEmail(params: SendPasswordReset) {
    const channel = this.resolveChannel(params.channel);
    const token = createOtp();

    await this.prisma.passwordResetToken.updateMany({
      where: { userId: params.userId, consumedAt: null },
      data: { consumedAt: new Date() },
    });
    await this.prisma.passwordResetToken.create({
      data: {
        userId: params.userId,
        tokenHash: hashToken(token),
        expiresAt: new Date(Date.now() + 1000 * 60 * AUTH_EMAIL_TTL.OTP_MINUTES),
      },
    });

    await this.deliverOtp({
      channel,
      email: params.email,
      phone: params.phone ?? null,
      token,
      kind: "password_reset",
    });
  }

  deliverVerification(payload: Verification) {
    return this.emailService.sendVerificationEmail(payload);
  }

  deliverPasswordReset(payload: PasswordReset) {
    return this.emailService.sendPasswordResetEmail(payload);
  }

  async deliverVerificationSms(payload: SmsPayload) {
    await this.twilio.send({
      to: payload.to,
      body: `Your ${PLATFORM.name} verification code is ${payload.token}. It expires in ${payload.expiresInMinutes} minutes.`,
    });
  }

  async deliverPasswordResetSms(payload: SmsPayload) {
    await this.twilio.send({
      to: payload.to,
      body: `Your ${PLATFORM.name} password reset code is ${payload.token}. It expires in ${payload.expiresInMinutes} minutes.`,
    });
  }

  private resolveChannel(channel?: Channel): Channel {
    return channel === "sms" ? "sms" : "email";
  }

  private async deliverOtp(params: {
    channel: Channel;
    email: string;
    phone?: string | null;
    token: string;
    kind: "verification" | "password_reset";
  }) {
    const expiresInMinutes = AUTH_EMAIL_TTL.OTP_MINUTES;

    if (params.channel === "email") {
      const payload = {
        to: params.email,
        token: params.token,
        expiresInMinutes,
      };
      if (params.kind === "verification") {
        await this.queue.enqueueVerification(payload);
      } else {
        await this.queue.enqueuePasswordReset(payload);
      }
      return;
    }

    const phone = params.phone?.trim();
    if (!phone) {
      throw new BadRequestException("Phone number is required for SMS OTP");
    }
    if (!this.twilio.isConfigured()) {
      throw new ServiceUnavailableException("SMS is not configured");
    }

    const payload: SmsPayload = {
      to: phone,
      token: params.token,
      expiresInMinutes,
    };
    if (params.kind === "verification") {
      await this.queue.enqueueVerificationSms(payload);
    } else {
      await this.queue.enqueuePasswordResetSms(payload);
    }
  }
}
