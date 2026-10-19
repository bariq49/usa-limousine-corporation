import { IsOptional, IsString, MinLength } from "class-validator";

export class SubscribeDto {
  @IsString()
  @MinLength(1)
  planId!: string;

  @IsOptional()
  @IsString()
  transactionId?: string;
}

export class RenewDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  planId?: string;

  @IsOptional()
  @IsString()
  transactionId?: string;
}

export class UpgradeDto {
  @IsString()
  @MinLength(1)
  planId!: string;

  @IsOptional()
  @IsString()
  transactionId?: string;
}

export class DowngradeDto {
  @IsString()
  @MinLength(1)
  planId!: string;
}
