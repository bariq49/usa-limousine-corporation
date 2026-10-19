import { DriverDeleteStatus, DriverShift } from "@prisma/client";
import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
  ValidateNested,
} from "class-validator";
import { ApiFeatureQueryDto } from "../../../common/api-feature";
import { DRIVER_LANGUAGES_MAX, DRIVER_LANGUAGES_MIN } from "../constants/languages.constants";
import { LanguageItemDto } from "./language.dto";

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  lastName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  phone?: string;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsUrl({ require_tld: false })
  @MaxLength(2_048)
  avatarUrl?: string | null;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MaxLength(2_000)
  about?: string | null;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  address?: string | null;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MinLength(1)
  @MaxLength(32)
  houseNo?: string | null;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  streetName?: string | null;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MinLength(1)
  @MaxLength(32)
  postalCode?: string | null;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  city?: string | null;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  province?: string | null;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  country?: string | null;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MinLength(2)
  @MaxLength(8)
  countryCode?: string | null;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(80)
  yearsExperience?: number | null;

  @IsOptional()
  @IsEnum(DriverShift)
  shift?: DriverShift;

  @IsOptional()
  @ValidateIf((body: UpdateProfileDto) => body.shift !== DriverShift.FLEXIBLE)
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "startTime must be HH:mm" })
  startTime?: string | null;

  @IsOptional()
  @ValidateIf((body: UpdateProfileDto) => body.shift !== DriverShift.FLEXIBLE)
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "endTime must be HH:mm" })
  endTime?: string | null;

  /** Full replace when sent (1–20 unique ISO codes). Omit to leave unchanged. */
  @IsOptional()
  @IsArray()
  @ArrayMinSize(DRIVER_LANGUAGES_MIN)
  @ArrayMaxSize(DRIVER_LANGUAGES_MAX)
  @ValidateNested({ each: true })
  @Type(() => LanguageItemDto)
  languages?: LanguageItemDto[];

  @IsOptional()
  @IsBoolean()
  dressesInSuit?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  services?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  service?: string[];
}

export class DeleteDto {
  @IsOptional()
  @ValidateIf((_, value) => value !== null && value !== "")
  @IsString()
  @MinLength(1)
  @MaxLength(1_000)
  reason?: string | null;
}

export class DeleteQueryDto extends ApiFeatureQueryDto {
  @IsOptional()
  @IsEnum(DriverDeleteStatus)
  status?: DriverDeleteStatus;
}

export class RejectDeleteDto {
  @IsOptional()
  @ValidateIf((_, value) => value !== null && value !== "")
  @IsString()
  @MinLength(1)
  @MaxLength(1_000)
  adminNote?: string | null;
}
