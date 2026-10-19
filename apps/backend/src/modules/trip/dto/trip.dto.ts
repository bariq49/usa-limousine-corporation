import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";
import { TripStatus } from "@prisma/client";
import { ApiFeatureQueryDto } from "../../../common/api-feature/api-feature-query.dto";

export class CreateDto {
  @IsString()
  bookingId!: string;
}

export class CancelDto {
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  cancellationReason?: string;
}

export class ReviewDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comment?: string;
}

export class QueryDto extends ApiFeatureQueryDto {
  @IsOptional()
  @IsEnum(TripStatus)
  status?: TripStatus;
}

export class ListQueryDto extends ApiFeatureQueryDto {}
