import { Transform } from "class-transformer";
import { IsBoolean, IsEnum, IsOptional } from "class-validator";
import { Audience } from "@prisma/client";
import { ApiFeatureQueryDto } from "../../../common/api-feature";

export class QueryDto extends ApiFeatureQueryDto {
  @IsOptional()
  @IsEnum(Audience)
  audience?: Audience;

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
