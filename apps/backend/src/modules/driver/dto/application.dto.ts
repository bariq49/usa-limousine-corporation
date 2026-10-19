import { DriverApprovalStatus, DriverOnboardingStatus } from "@prisma/client";
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";
import { ApiFeatureQueryDto } from "../../../common/api-feature";

export class RejectDto {
  @IsString()
  @MinLength(1)
  @MaxLength(1_000)
  reason!: string;
}

export class BulkDeleteApplicationsDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(200)
  @IsString({ each: true })
  ids!: string[];
}

export class ApplicationQueryDto extends ApiFeatureQueryDto {
  @IsOptional()
  @IsEnum(DriverApprovalStatus)
  approvalStatus?: DriverApprovalStatus;

  @IsOptional()
  @IsEnum(DriverOnboardingStatus)
  onboardingStatus?: DriverOnboardingStatus;
}
