import { Type } from "class-transformer";
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
  MinLength,
} from "class-validator";

export class CreateDto {
  @IsString()
  @IsNotEmpty()
  bookingId!: string;

  /** Custom quote. Omit or null to accept the booking fair/suggested price. */
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  @Max(1_000_000)
  quotedPrice?: number | null;

  @IsOptional()
  @IsString()
  @MinLength(8)
  idempotencyKey?: string;
}

export class AcceptDto {
  @IsOptional()
  @IsUrl({ require_tld: false })
  successUrl?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  cancelUrl?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  idempotencyKey?: string;
}

/** Customer raises the booking fair/suggested price while seeking offers. */
export class CounterDto {
  @IsNumber()
  @Min(0.01)
  @Max(1_000_000)
  total!: number;
}

export class AvailableQueryDto {
  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number;
}
