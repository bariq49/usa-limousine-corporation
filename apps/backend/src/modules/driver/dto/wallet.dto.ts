import { WalletTransactionType } from "@prisma/client";
import { IsEnum, IsOptional } from "class-validator";
import { ApiFeatureQueryDto } from "../../../common/api-feature/api-feature-query.dto";

export class QueryDto extends ApiFeatureQueryDto {
  @IsOptional()
  @IsEnum(WalletTransactionType)
  type?: WalletTransactionType;
}
