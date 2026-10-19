import { Transform } from "class-transformer";
import { IsBoolean, IsOptional } from "class-validator";
import { ApiFeatureQueryDto } from "../../../common/api-feature";

export class QueryDto extends ApiFeatureQueryDto {
  @IsOptional()
  @Transform(({ obj, value }) => {
    const raw = obj?.isSpecial ?? value;
    if (raw === true || raw === "true") {
      return true;
    }
    if (raw === false || raw === "false") {
      return false;
    }
    return undefined;
  })
  @IsBoolean()
  isSpecial?: boolean;

  @IsOptional()
  @Transform(({ obj, value }) => {
    const raw = obj?.isActive ?? value;
    if (raw === true || raw === "true") {
      return true;
    }
    if (raw === false || raw === "false") {
      return false;
    }
    return undefined;
  })
  @IsBoolean()
  isActive?: boolean;
}

export { QueryDto as LuggageQueryDto };
