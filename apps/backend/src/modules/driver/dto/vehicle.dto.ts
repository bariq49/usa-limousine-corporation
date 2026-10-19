import { Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
  ValidateNested,
} from "class-validator";

export class LuggageCapacityItemDto {
  @IsString()
  @MinLength(1)
  luggageTypeId!: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(50)
  quantity!: number;
}

export class VehicleDto {
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  make!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(80)
  model!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1980)
  @Max(2100)
  year!: number;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(40)
  color?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(32)
  licensePlate!: string;

  @IsString()
  @MinLength(1)
  vehicleCategoryId!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => LuggageCapacityItemDto)
  luggageCapacity!: LuggageCapacityItemDto[];

  @IsUrl({ require_tld: false })
  @MaxLength(2_048)
  registrationDocument!: string;

  @IsUrl({ require_tld: false })
  @MaxLength(2_048)
  frontView!: string;

  @IsUrl({ require_tld: false })
  @MaxLength(2_048)
  backView!: string;

  @IsUrl({ require_tld: false })
  @MaxLength(2_048)
  leftSideView!: string;

  @IsUrl({ require_tld: false })
  @MaxLength(2_048)
  rightSideView!: string;

  @IsUrl({ require_tld: false })
  @MaxLength(2_048)
  insideView!: string;

  @IsUrl({ require_tld: false })
  @MaxLength(2_048)
  licensePlateView!: string;
}

export class UpdateVehicleDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  make?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  model?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1980)
  @Max(2100)
  year?: number;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MinLength(1)
  @MaxLength(40)
  color?: string | null;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(32)
  licensePlate?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  vehicleCategoryId?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => LuggageCapacityItemDto)
  luggageCapacity?: LuggageCapacityItemDto[];

  @IsOptional()
  @IsUrl({ require_tld: false })
  @MaxLength(2_048)
  registrationDocument?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  @MaxLength(2_048)
  frontView?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  @MaxLength(2_048)
  backView?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  @MaxLength(2_048)
  leftSideView?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  @MaxLength(2_048)
  rightSideView?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  @MaxLength(2_048)
  insideView?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  @MaxLength(2_048)
  licensePlateView?: string;
}
