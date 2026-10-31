import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from "class-validator";
import { PaymentMode, PaymentStatus, RefundStatus } from "@prisma/client";
import { ApiFeatureQueryDto } from "../../../common/api-feature/api-feature-query.dto";

export class QueryDto extends ApiFeatureQueryDto {
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus | undefined;

  @IsOptional()
  @IsEnum(PaymentMode)
  mode?: PaymentMode | undefined;
}

export class RefundQueryDto extends ApiFeatureQueryDto {
  @IsOptional()
  @IsEnum(RefundStatus)
  status?: RefundStatus | undefined;
}

export class CreateRefundDto {
  @IsString()
  @IsNotEmpty()
  paymentId!: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  amount?: number | undefined;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string | undefined;

  @IsOptional()
  @IsBoolean()
  manual?: boolean | undefined;
}

export class CompleteRefundDto {
  @IsOptional()
  @IsBoolean()
  manual?: boolean | undefined;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string | undefined;
}

export class RejectRefundDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string | undefined;
}

export class RefundDto {
  @IsOptional()
  @IsNumber()
  @IsPositive()
  amount?: number | undefined;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string | undefined;

  @IsOptional()
  @IsBoolean()
  manual?: boolean | undefined;
}
