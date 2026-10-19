import { IsEnum, IsNumber, IsOptional, IsPositive, IsString } from "class-validator";
import { PayoutStatus, WalletOwnerType } from "@prisma/client";
import { ApiFeatureQueryDto } from "../../../common/api-feature/api-feature-query.dto";

export class RequestPayoutDto {
  @IsNumber()
  @IsPositive()
  amount!: number;

  @IsOptional()
  @IsString()
  bankAccountId?: string;

  @IsOptional()
  @IsString()
  idempotencyKey?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class QueryDto extends ApiFeatureQueryDto {
  @IsOptional()
  @IsEnum(PayoutStatus)
  status?: PayoutStatus;

  @IsOptional()
  @IsString()
  payoutNumber?: string;

  @IsOptional()
  @IsEnum(WalletOwnerType)
  recipientType?: WalletOwnerType;

  @IsOptional()
  @IsString()
  recipientId?: string;
}
