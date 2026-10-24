import { IsBoolean, IsOptional } from "class-validator";

export class UpdateSettingsDto {
  @IsOptional()
  @IsBoolean()
  email?: boolean;

  /** In-app (dashboard bell) notifications. */
  @IsOptional()
  @IsBoolean()
  notification?: boolean;

  @IsOptional()
  @IsBoolean()
  sms?: boolean;
}
