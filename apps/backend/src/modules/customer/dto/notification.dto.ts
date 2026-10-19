import { NotificationType } from "@prisma/client";
import { Transform } from "class-transformer";
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
} from "class-validator";
import { ApiFeatureQueryDto } from "../../../common/api-feature/api-feature-query.dto";

export class BulkDeleteDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(200)
  @IsString({ each: true })
  ids!: string[];
}

export class QueryDto extends ApiFeatureQueryDto {
  @IsOptional()
  @Transform(({ value }) => {
    if (value === true || value === "true" || value === "1") {
      return true;
    }
    if (value === false || value === "false" || value === "0") {
      return false;
    }
    return undefined;
  })
  @IsBoolean()
  unreadOnly?: boolean;

  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;
}
