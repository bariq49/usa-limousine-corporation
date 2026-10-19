import { Type } from "class-transformer";
import { IsEnum, IsNumber, IsObject, IsOptional, IsString, IsUrl, Min } from "class-validator";
import { PaymentPurpose } from "@prisma/client";

export class CheckoutDto {
  @IsEnum(PaymentPurpose)
  purpose!: PaymentPurpose;

  @IsString()
  referenceId!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsString()
  description!: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  successUrl?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  cancelUrl?: string;

  @IsOptional()
  @IsString()
  transactionId?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, string>;
}
