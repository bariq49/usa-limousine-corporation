import { Transform } from "class-transformer";
import { IsBoolean, IsEnum, IsOptional } from "class-validator";
import { ExtraServiceType } from "@prisma/client";
import { ApiFeatureQueryDto } from "../../../common/api-feature";

export class QueryDto extends ApiFeatureQueryDto {
  @IsOptional()
  @IsEnum(ExtraServiceType)
  type?: ExtraServiceType;

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
