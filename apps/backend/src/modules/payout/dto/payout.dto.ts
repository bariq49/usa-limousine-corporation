import { IsEnum, IsOptional, IsString } from "class-validator";
import { PayoutStatus, WalletOwnerType } from "@prisma/client";
import { ApiFeatureQueryDto } from "../../../common/api-feature/api-feature-query.dto";

export class QueryDto extends ApiFeatureQueryDto {
  @IsOptional()
  @IsEnum(PayoutStatus)
  status?: PayoutStatus;

  @IsOptional()
  @IsEnum(WalletOwnerType)
  recipientType?: WalletOwnerType;

  @IsOptional()
  @IsString()
  recipientId?: string;

  @IsOptional()
  @IsString()
  payoutNumber?: string;
}

export class RejectDto {
  @IsString()
  reason!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class NotesDto {
  @IsOptional()
  @IsString()
  notes?: string;
}
