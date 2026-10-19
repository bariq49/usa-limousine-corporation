import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { RtcRole, RtcTokenBuilder } from "agora-token";
import { getConfig, isComplete } from "./agora.config";
import type { Config, RtcRoleName, RtcTokenInput, RtcTokenResult } from "./types/agora";

@Injectable()
export class AgoraService {
  private readonly logger = new Logger(AgoraService.name);
  private readonly config: Config;

  constructor(@Inject(ConfigService) configService: ConfigService) {
    this.config = getConfig(configService);

    if (!isComplete(this.config)) {
      this.logger.warn("Agora RTC disabled: set AGORA_APP_ID and AGORA_APP_CERTIFICATE");
      return;
    }

    this.logger.log("Agora RTC token service ready");
  }

  isConfigured(): boolean {
    return isComplete(this.config);
  }

  getAppId(): string {
    if (!isComplete(this.config)) {
      throw new ServiceUnavailableException("Agora is not configured");
    }
    return this.config.appId;
  }

  buildRtcToken(input: RtcTokenInput): RtcTokenResult {
    if (!isComplete(this.config)) {
      throw new ServiceUnavailableException("Agora is not configured");
    }

    const channel = input.channel?.trim();
    if (!channel) {
      throw new BadRequestException("Agora channel is required");
    }
    if (!Number.isInteger(input.uid) || input.uid < 0 || input.uid > 0xffff_ffff) {
      throw new BadRequestException("Agora uid must be a 32-bit unsigned integer");
    }

    const roleName: RtcRoleName = input.role ?? "publisher";
    const role = roleName === "subscriber" ? RtcRole.SUBSCRIBER : RtcRole.PUBLISHER;
    const ttlSeconds =
      typeof input.ttlSeconds === "number" && input.ttlSeconds > 0
        ? Math.floor(input.ttlSeconds)
        : this.config.tokenTtlSeconds;

    const token = RtcTokenBuilder.buildTokenWithUid(
      this.config.appId,
      this.config.appCertificate,
      channel,
      input.uid,
      role,
      ttlSeconds,
      ttlSeconds,
    );

    return {
      appId: this.config.appId,
      channel,
      uid: input.uid,
      token,
      role: roleName,
      expiresAt: new Date(Date.now() + ttlSeconds * 1000),
    };
  }

  healthCheck(): boolean {
    return this.isConfigured();
  }
}
