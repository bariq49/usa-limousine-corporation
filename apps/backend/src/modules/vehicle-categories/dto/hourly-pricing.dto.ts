import { Type } from "class-transformer";
import { IsEnum, IsInt, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";
import { PricingStatus } from "@prisma/client";
import { ApiFeatureQueryDto } from "../../../common/api-feature";

const MAX_HOURLY_HOURS = 168;

export class CreateDto {
  @IsString()
  vehicleCategoryId!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_HOURLY_HOURS)
  durationHours!: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  basePrice!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  includedDistance?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  extraDistanceRate?: number;

  @IsOptional()
  @IsEnum(PricingStatus)
  status?: PricingStatus;
}

export class UpdateDto {
  @IsOptional()
  @IsString()
  vehicleCategoryId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_HOURLY_HOURS)
  durationHours?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  basePrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  includedDistance?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  extraDistanceRate?: number;

  @IsOptional()
  @IsEnum(PricingStatus)
  status?: PricingStatus;
}

export class QueryDto extends ApiFeatureQueryDto {
  @IsOptional()
  @IsString()
  vehicleCategoryId?: string;

  @IsOptional()
  @IsEnum(PricingStatus)
  status?: PricingStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  durationHours?: number;
}

export class DurationQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  durationHours!: number;
}
