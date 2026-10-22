import { CustomerType } from "@prisma/client";
import { IsEnum, IsOptional } from "class-validator";
import { ApiFeatureQueryDto } from "../../../common/api-feature/api-feature-query.dto";

export class AdminCustomerQueryDto extends ApiFeatureQueryDto {
  @IsOptional()
  @IsEnum(CustomerType)
  type?: CustomerType;
}
