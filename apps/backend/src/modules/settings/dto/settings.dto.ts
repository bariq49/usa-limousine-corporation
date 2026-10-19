import { IsBoolean, IsEnum, IsInt, IsNumber, IsOptional, Max, Min } from "class-validator";
import { PaymentMode } from "@prisma/client";

export class UpdateDto {
  @IsOptional()
  @IsEnum(PaymentMode)
  paymentMode?: PaymentMode;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  payoutMin?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  payoutIntervalDays?: number;

  @IsOptional()
  @IsBoolean()
  requireSubscription?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0.5)
  @Max(100)
  offerRadius?: number;

  @IsOptional()
  @IsNumber()
  @Min(0.5)
  @Max(50)
  offerExpandStep?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(200)
  offerExpandMax?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(500)
  offerGeoMatchCount?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  offerMaxPerBooking?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  offerMaxQuotesPerDriver?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(60)
  offerTtlMin?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(180)
  offerSessionTtlMin?: number;

  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Max(1)
  offerQuoteMinFactor?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  offerQuoteMaxFactor?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(180)
  paymentTimeoutMin?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  cancelRefundBeforeStartPercent?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  cancelRefundAfterStartPercent?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  driverCancelRefundPercent?: number;

  @IsOptional()
  @IsBoolean()
  driverCancelReseek?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(120)
  pickupFreeWaitMin?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  noShowRefundPercent?: number;
}
