import { Transform } from "class-transformer";
import { IsBoolean, IsOptional } from "class-validator";
import { ApiFeatureQueryDto } from "../../../common/api-feature";

export class VehicleCategoryQueryDto extends ApiFeatureQueryDto {
  @IsOptional()
  @Transform(({ value }) => {
    if (value === true || value === "true") {
      return true;
    }
    if (value === false || value === "false") {
      return false;
    }
    return value;
  })
  @IsBoolean()
  isActive?: boolean;
}
