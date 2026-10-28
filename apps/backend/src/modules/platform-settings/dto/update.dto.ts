import { Type } from "class-transformer";
import { IsEnum, IsInt, IsNumber, IsOptional, Max, Min } from "class-validator";
import { NoticeUnit, PaymentMode } from "@prisma/client";

/** Every field is optional; only the fields sent are changed. Rates are percentages (0-100). */
export class UpdateDto {
  @IsOptional()
  @IsEnum(PaymentMode)
  paymentMode?: PaymentMode;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  fuelSurchargeRate?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  gratuityRate?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  taxRate?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  transactionFeeRate?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  oneWayDiscountRate?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  returnDiscountRate?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  airportPickupFee?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  stopFee?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  meetAndGreetFee?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  emailNotificationFee?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  smsNotificationFee?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(10_000)
  minBookingNotice?: number;

  @IsOptional()
  @IsEnum(NoticeUnit)
  minBookingNoticeUnit?: NoticeUnit;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(10_000)
  cancellationNotice?: number;

  @IsOptional()
  @IsEnum(NoticeUnit)
  cancellationNoticeUnit?: NoticeUnit;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  cancellationRefundRate?: number;
}
