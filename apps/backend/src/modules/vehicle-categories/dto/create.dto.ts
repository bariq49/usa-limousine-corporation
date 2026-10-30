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
  ValidateNested,
} from "class-validator";
import { StandardLuggageCapacityDto } from "./luggage-capacity.dto";

export class CreateDto {
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  models?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(2_048)
  image?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  passengerCount!: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => StandardLuggageCapacityDto)
  standardLuggageCapacity!: StandardLuggageCapacityDto[];
}
