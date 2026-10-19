import { IsEnum, IsOptional, IsString } from "class-validator";
import { PricingStatus, PricingType } from "@prisma/client";
import { ApiFeatureQueryDto } from "../../../common/api-feature";

export class PricingQueryDto extends ApiFeatureQueryDto {
  @IsOptional()
  @IsString()
  vehicleCategoryId?: string;

  @IsOptional()
  @IsEnum(PricingStatus)
  status?: PricingStatus;

  @IsOptional()
  @IsEnum(PricingType)
  pricingType?: PricingType;
}
