import { IsOptional, IsString } from "class-validator";
import { ApiFeatureQueryDto } from "../../../common/api-feature";

export class QueryDto extends ApiFeatureQueryDto {
  @IsOptional()
  @IsString()
  vehicleCategoryId?: string;

  @IsOptional()
  @IsString()
  make?: string;
}

export { QueryDto as VehicleQueryDto };
