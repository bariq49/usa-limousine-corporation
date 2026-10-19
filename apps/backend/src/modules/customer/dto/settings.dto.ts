import { IsBoolean, IsOptional, IsString, MaxLength } from "class-validator";

export class UpdateSettingsDto {
  @IsOptional()
  @IsBoolean()
  email?: boolean;

  @IsOptional()
  @IsBoolean()
  push?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  timezone?: string;
}
