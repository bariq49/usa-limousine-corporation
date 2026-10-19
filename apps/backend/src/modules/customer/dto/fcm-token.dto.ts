import { IsIn, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class UpdateFcmTokenDto {
  @IsString()
  @MinLength(1)
  @MaxLength(4096)
  token!: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  deviceId?: string;

  @IsOptional()
  @IsString()
  @IsIn(["ios", "android", "web"])
  platform?: string;
}
