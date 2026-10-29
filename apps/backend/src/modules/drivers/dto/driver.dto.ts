import { Transform, Type } from "class-transformer";
import {
  IsEmail,
  IsEnum,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";
import { BookingStatus, DriverStatus } from "@prisma/client";
import { ApiFeatureQueryDto } from "../../../common/api-feature/api-feature-query.dto";
import { STATS_PERIODS, type StatsPeriod } from "../../../common/utils/period-buckets";

const trim = ({ value }: { value: unknown }) => (typeof value === "string" ? value.trim() : value);

export class CreateDto {
  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  firstName!: string;

  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  lastName!: string;

  @Transform(({ value }) => (typeof value === "string" ? value.trim().toLowerCase() : value))
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @Transform(trim)
  @IsString()
  @MinLength(7)
  @MaxLength(32)
  phone!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  avatar?: string | null;

  @IsString()
  @MinLength(1)
  vehicleCategoryId!: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(60)
  licenseNumber?: string | null;

  @IsOptional()
  @IsEnum(DriverStatus)
  status?: DriverStatus;
}

export class UpdateDto {
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  firstName?: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  lastName?: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === "string" ? value.trim().toLowerCase() : value))
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MinLength(7)
  @MaxLength(32)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  avatar?: string | null;

  @IsOptional()
  @IsString()
  @MinLength(1)
  vehicleCategoryId?: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(60)
  licenseNumber?: string | null;

  @IsOptional()
  @IsEnum(DriverStatus)
  status?: DriverStatus;
}

export class QueryDto extends ApiFeatureQueryDto {
  @IsOptional()
  @IsEnum(DriverStatus)
  status?: DriverStatus;

  @IsOptional()
  @IsString()
  vehicleCategoryId?: string;
}

export class StatsQueryDto {
  @IsOptional()
  @IsIn(STATS_PERIODS)
  period: StatsPeriod = "monthly";
}

export class DriverBookingsQueryDto extends ApiFeatureQueryDto {
  @IsOptional()
  @IsEnum(BookingStatus)
  bookingStatus?: BookingStatus;
}

export class AssignDto {
  @IsString()
  @MinLength(1)
  driverId!: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  commissionRate!: number;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(1000)
  note?: string;
}
