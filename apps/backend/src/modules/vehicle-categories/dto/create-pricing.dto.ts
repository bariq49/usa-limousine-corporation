import { Type } from "class-transformer";
import { IsEnum, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { PricingStatus, PricingType } from "@prisma/client";

export class CreatePricingDto {
  @IsString()
  vehicleCategoryId!: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  minimumDistance!: number;

  /** Maximum distance in km. When null or omitted, this tier has no upper limit (infinite distance). */
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  maximumDistance?: number | null;

  @IsEnum(PricingType)
  pricingType!: PricingType;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  basePrice!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  perUnitRate?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  percentageRate?: number | null;

  @IsOptional()
  @IsEnum(PricingStatus)
  status?: PricingStatus;
}
