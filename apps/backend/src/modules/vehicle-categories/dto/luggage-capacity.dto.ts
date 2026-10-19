import { Type } from "class-transformer";
import { IsInt, IsString, Max, Min, MinLength } from "class-validator";

export class StandardLuggageCapacityDto {
  @IsString()
  @MinLength(1)
  luggageTypeId!: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(50)
  quantity!: number;
}

export class SpecialLuggageCapacityDto extends StandardLuggageCapacityDto {}

export type VehicleCategoryLuggageCapacityInput = {
  luggageTypeId: string;
  quantity: number;
};
